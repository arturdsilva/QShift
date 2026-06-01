// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/05_create_schedule.cy.js
// Fluxo: Seleção de semana no calendário → configuração de turnos → geração de escala
// ─────────────────────────────────────────────────────────────────────────────

describe('Fluxo de Criação de Escala', () => {
  let testUser;
  let shifts;
  let createdEmployeeIds = [];

  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;
      shifts = data.shifts;

      // Limpa o IndexedDB de templates de turnos antes de cada run
      cy.clearTemplatesDB();

      // Cria todos os 5 funcionários com disponibilidade full-week via API
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

            // Disponibilidade total: seg a dom, 06:00–22:00
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
    });
  });

  beforeEach(() => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
    });
  });

  // ── ETAPA 1: StaffPage ───────────────────────────────────────────────────

  it('deve exibir todos os funcionários na StaffPage', () => {
    cy.visit('/staff');
    cy.fixture('mockData').then((data) => {
      data.employees.forEach((emp) => {
        cy.contains(emp.name).should('be.visible');
      });
    });
    cy.get('button').contains('Next').should('be.visible');
  });

  it('deve navegar para /calendar ao clicar em Next', () => {
    cy.visit('/staff');
    cy.get('button').contains('Next').click();
    cy.url().should('include', '/calendar');
    cy.contains('Calendar').should('be.visible');
  });

  // ── ETAPA 2: CalendarPage ────────────────────────────────────────────────

  it('deve exibir o calendário com navegação de meses', () => {
    cy.visit('/staff');
    cy.get('button').contains('Next').click();
    cy.url().should('include', '/calendar');
    cy.get('button[title="Next month"]').click();
    cy.get('.calendar-page__month-label').should('be.visible');
  });

  it('deve selecionar uma semana e habilitar o botão Next', () => {
    cy.visit('/staff');
    cy.get('button').contains('Next').click();
    cy.url().should('include', '/calendar');

    cy.get('table').should('be.visible');
    // Avança meses para evitar semanas já geradas
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();

    cy.get('table tbody tr').first().within(() => {
      cy.get('button').not(':disabled').first().click({ force: true });
    });

    cy.get('button').contains('Next').should('be.visible');
  });

  it('deve navegar para /shift-config após selecionar semana', () => {
    cy.visit('/staff');
    cy.get('button').contains('Next').click();
    cy.url().should('include', '/calendar');

    cy.get('table').should('be.visible');
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();

    cy.get('table tbody tr').first().within(() => {
      cy.get('button').not(':disabled').first().click({ force: true });
    });

    cy.get('.calendar-page__actions button').contains('Next').click();
    cy.url().should('include', '/shift-config');
    cy.contains('Shift Configuration').should('be.visible');
  });

  // ── ETAPA 3: ShiftConfigPage ─────────────────────────────────────────────

  it('deve criar todos os turnos do fixture, arrastar para os dias e gerar a escala', () => {
    cy.visit('/staff');
    cy.get('button').contains('Next').click();
    cy.url().should('include', '/calendar');

    cy.get('table').should('be.visible');
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();
    cy.get('button[title="Next month"]').click();

    cy.get('table tbody tr').first().within(() => {
      cy.get('button').not(':disabled').first().click({ force: true });
    });
    cy.get('.calendar-page__actions button').contains('Next').click();
    cy.url().should('include', '/shift-config');

    cy.fixture('mockData').then((data) => {
      const DAY_SUFFIX = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

      // O useTemplateStore valida unicidade por nome → usamos sufixo de dia
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

      // Turnos 1/2/3 → seg(0) a sex(4) [nomes únicos por dia]
      [0, 1, 2, 3, 4].forEach((dayIdx) => {
        addShiftToDay(dayIdx, data.shifts[0]);
        addShiftToDay(dayIdx, data.shifts[1]);
        addShiftToDay(dayIdx, data.shifts[2]);
      });

      // Turno Sab 1/2/3 → sab(5)
      addShiftToDay(5, data.shifts[3]);
      addShiftToDay(5, data.shifts[4]);
      addShiftToDay(5, data.shifts[5]);
    });

    cy.get('.obj-weekly-grid').should('be.visible');
    cy.get('.shift-config__create-btn').click();

    // Aguarda a navegação async (geração = polling de job) terminar
    cy.url({ timeout: 60000 }).should('not.include', '/shift-config');

    // Agora verifica para onde foi e clica Approved se necessário
    cy.url().then((url) => {
      if (url.includes('/schedule')) {
        cy.on('window:alert', () => true);
        cy.get('button').contains('Approved').click();
        cy.url().should('include', '/staff');
      }
      // /staff direto → possible=false
    });
  });

  after(() => {
    // Remove todos os funcionários criados para o teste
    cy.fixture('mockData').then((data) => {
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200) {
          createdEmployeeIds.forEach((id) => {
            cy.request({
              method: 'DELETE',
              url: `${data.apiBase}/employees/${id}`,
              headers: { Authorization: `Bearer ${res.body.access_token}` },
              failOnStatusCode: false,
            });
          });
        }
      });
    });
  });
});
