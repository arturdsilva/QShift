// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/08_employee_reports.cy.js
// TDD Sprint 5 — US-14: Consistência e qualidade da página Employee Reports
//
// Fluxo completo encadeado (mesmo padrão de 00_full_flow):
//   Setup via before():
//     1. Registra usuário de teste
//     2. Cria 5 funcionários com disponibilidade full-week via API
//     3. Gera e aprova uma escala (necessário para que Employee Reports tenha dados)
//
//   Testes (it):
//     - Navega Reports → card "Employees" → /employee-reports sem alert()
//     - API sempre chamada de novo (sem cache stale do sessionStorage)
//     - Horas exibidas com no máximo 2 casas decimais
// ─────────────────────────────────────────────────────────────────────────────

describe('US-14 — Employee Reports: consistência de dados com o backend', () => {
  let createdEmployeeIds = [];
  let scheduleCreated = false;

  // ── SETUP: registro → funcionários → escala aprovada ─────────────────────
  before(() => {
    cy.fixture('mockData').then((data) => {
      cy.clearTemplatesDB();

      // 1. Limpa estado residual de runs anteriores
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((loginRes) => {
        if (loginRes.status === 200) {
          const token = loginRes.body.access_token;
          // Remove funcionários residuais
          data.employees.forEach((emp) => {
            cy.deleteEmployeeByNameViaApi(emp.name, token);
          });
          // Remove o usuário de teste
          cy.request({
            method: 'DELETE',
            url: `${data.apiBase}/users/me`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }
      });

      // 2. Registra o usuário de teste
      cy.visit('/register');
      cy.get('#email').type(data.testUser.email);
      cy.get('#confirm-email').type(data.testUser.email);
      cy.get('#password').type(data.testUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');

      // 3. Obtém token e cria funcionários + disponibilidade via API
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
      }).then((loginRes) => {
        const token = loginRes.body.access_token;

        data.employees.forEach((emp) => {
          cy.request({
            method: 'POST',
            url: `${data.apiBase}/employees`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: emp.name, active: true, weekly_workload_hours: emp.workload },
          }).then((empRes) => {
            createdEmployeeIds.push(empRes.body.id);

            // Disponibilidade full-week: seg(0) a dom(6), 06:00–22:00
            [0, 1, 2, 3, 4, 5, 6].forEach((weekday) => {
              cy.request({
                method: 'POST',
                url: `${data.apiBase}/employees/${empRes.body.id}/availabilities`,
                headers: { Authorization: `Bearer ${token}` },
                body: { weekday, start_time: '06:00', end_time: '22:00' },
                failOnStatusCode: false,
              });
            });
          });
        });
      });

      // 4. Gera e aprova uma escala (necessário para Employee Reports ter dados)
      cy.loginViaApi(data.testUser.email, data.testUser.password);
      cy.visit('/staff');
      cy.get('button').contains('Next').click();
      cy.url().should('include', '/calendar');

      // Avança 3 meses para evitar conflito com semanas já existentes
      cy.get('button[title="Next month"]').click();
      cy.get('button[title="Next month"]').click();
      cy.get('button[title="Next month"]').click();

      cy.get('table tbody tr').first().within(() => {
        cy.get('button').not(':disabled').first().click({ force: true });
      });

      cy.get('.calendar-page__actions button').contains('Next').click();
      cy.url().should('include', '/shift-config');

      // Adiciona turnos usando o botão "+" de cada coluna (sem drag-and-drop)
      const DAY_SUFFIX = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

      const addShiftToDay = (dayColIndex, shift) => {
        const uniqueName = `${shift.name} ${DAY_SUFFIX[dayColIndex]}`;

        cy.get('.obj-day-column').eq(dayColIndex)
          .find('.obj-day-column__add-btn')
          .click({ force: true });
        cy.contains('Create New Template').should('be.visible');
        cy.get('input[placeholder*="Morning Rush"]').clear().type(uniqueName);
        cy.get('input[type="time"]').first().clear().type(shift.start);
        cy.get('input[type="time"]').last().clear().type(shift.end);
        cy.get('input[type="number"]').clear().type(shift.staff.toString());
        cy.get('button').contains('Save Template').click();
        cy.contains('Create New Template').should('not.exist');
      };

      // Turnos 1/2/3 → seg(0) a sex(4)
      [0, 1, 2, 3, 4].forEach((dayIdx) => {
        addShiftToDay(dayIdx, data.shifts[0]);
        addShiftToDay(dayIdx, data.shifts[1]);
        addShiftToDay(dayIdx, data.shifts[2]);
      });

      // Turno Sab 1/2/3 → sab(5)
      addShiftToDay(5, data.shifts[3]);
      addShiftToDay(5, data.shifts[4]);
      addShiftToDay(5, data.shifts[5]);

      // Dispara a geração (job assíncrono)
      cy.get('.shift-config__create-btn').click();
      cy.url({ timeout: 60000 }).should('not.include', '/shift-config');

      cy.url().then((url) => {
        if (url.includes('/schedule')) {
          cy.on('window:alert', () => true);
          cy.get('button').contains('Approved').click();
          cy.url().should('include', '/staff');
          scheduleCreated = true;
        }
      });
    });
  });

  // ── beforeEach: autentica via API antes de cada teste ─────────────────────
  beforeEach(() => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
    });
  });

  /**
   * Helper reutilizável: visita /staff, aguarda a API de funcionários
   * e salva a resposta no sessionStorage.
   *
   * Necessário porque cada cy.visit() reinicia o React e App.jsx lê
   * employees do sessionStorage no useState initializer. StaffPage
   * chama setEmployees() mas não persiste no sessionStorage, então
   * populamos manualmente para que /reports encontre os funcionários.
   */
  const loadEmployeesToSession = () => {
    cy.intercept('GET', '**/employees').as('loadEmployees');
    cy.visit('/staff');
    cy.wait('@loadEmployees').then((interception) => {
      if (interception.response.statusCode === 200 && interception.response.body.length > 0) {
        cy.window().then((win) => {
          win.sessionStorage.setItem('employees', JSON.stringify(interception.response.body));
        });
      }
    });
  };

  // ── Teste 1: navegação correta Reports → card Employees → /employee-reports
  it('deve navegar do card Employees em Reports para a página Employee Reports', () => {
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    loadEmployeesToSession();

    // Vai para /reports (página intermediária obrigatória no fluxo do app)
    cy.visit('/reports');
    cy.contains('Reports and Analysis').should('be.visible');

    // Clica no card "Employees" → deve navegar para /employee-reports
    cy.contains('Employees').click({ force: true });
    cy.url().should('include', '/employee-reports');
    cy.contains('Employees Reports').should('be.visible');

    // Confirma que alert() nunca foi chamado (bug corrigido)
    cy.then(() => {
      expect(alertStub).not.to.have.been.called;
    });
  });

  // ── Teste 2: dados consistentes com o backend (sem cache stale) ───────────
  it('deve chamar a API novamente ao retornar para Employee Reports na mesma sessão', () => {
    loadEmployeesToSession();

    // 1ª visita a /employee-reports
    cy.intercept('GET', '**/employees/*/report/**').as('firstFetch');
    cy.visit('/reports');
    cy.contains('Employees').click({ force: true });
    cy.url().should('include', '/employee-reports');
    cy.wait('@firstFetch');

    // Navega para outra página (simula mudança de contexto na mesma sessão)
    loadEmployeesToSession();

    // 2ª visita — a API deve ser chamada novamente (sem cache sessionStorage bloqueando)
    cy.intercept('GET', '**/employees/*/report/**').as('secondFetch');
    cy.visit('/reports');
    cy.contains('Employees').click({ force: true });
    cy.url().should('include', '/employee-reports');

    cy.wait('@secondFetch').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  });

  // ── Teste 3: horas exibidas com no máximo 2 casas decimais ───────────────
  it('não deve exibir horas com mais de 2 casas decimais', () => {
    loadEmployeesToSession();

    cy.intercept('GET', '**/employees/*/report/**').as('reportFetch');
    cy.visit('/reports');
    cy.contains('Employees').click({ force: true });
    cy.url().should('include', '/employee-reports');
    cy.wait('@reportFetch');

    // Nenhum número com 3+ casas decimais deve aparecer na tela
    cy.get('body').invoke('text').then((text) => {
      const hasExcessiveDecimals = /\d+\.\d{3,}/.test(text);
      expect(hasExcessiveDecimals).to.be.false;
    });
  });

  // ── TEARDOWN: remove dados criados pelo teste ─────────────────────────────
  after(() => {
    cy.fixture('mockData').then((data) => {
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status !== 200) return;
        const token = res.body.access_token;

        // Remove funcionários criados
        data.employees.forEach((emp) => {
          cy.deleteEmployeeByNameViaApi(emp.name, token);
        });

        // Remove o usuário de teste
        cy.request({
          method: 'DELETE',
          url: `${data.apiBase}/users/me`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    });
  });
});
