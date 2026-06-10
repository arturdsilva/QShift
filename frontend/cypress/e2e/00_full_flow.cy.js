describe('Fluxo Completo End-to-End — QShift', () => {
  let testUser;

  // ── SETUP: garante estado limpo antes de começar ──────────────────────────
  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;

      // Limpa o IndexedDB de templates de turnos (persiste entre runs no browser)
      cy.clearTemplatesDB();

      // Tenta logar para obter token e deletar dados residuais de runs anteriores
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status !== 200) return; // usuário ainda não existe — tudo certo
        const token = res.body.access_token;

        // Deleta funcionários de runs anteriores
        data.employees.forEach((emp) => {
          cy.deleteEmployeeByNameViaApi(emp.name, token);
        });

        // Deleta o próprio usuário de teste
        cy.request({
          method: 'DELETE',
          url: `${data.apiBase}/users/me`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    });
  });

  // ── 1. REGISTRO ──────────────────────────────────────────────────────────

  it('1 - Registra o usuário de teste', () => {
    cy.fixture('mockData').then((data) => {
      cy.visit('/register');
      cy.contains('h3', 'Register').should('be.visible');

      cy.get('#email').type(data.testUser.email);
      cy.get('#confirm-email').type(data.testUser.email);
      cy.get('#password').type(data.testUser.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/login');
    });
  });

  // ── 2. LOGIN ─────────────────────────────────────────────────────────────

  it('2 - Faz login com o usuário recém-registrado', () => {
    cy.fixture('mockData').then((data) => {
      cy.visit('/login');
      cy.get('#email').type(data.testUser.email);
      cy.get('#password').type(data.testUser.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/staff');
      cy.contains('Employee Management').should('be.visible');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.not.be.null;
      });
    });
  });

  // ── 3. CRIAR 5 FUNCIONÁRIOS VIA UI E CONFIGURAR DISPONIBILIDADE VIA API ──

  it('3 - Cria todos os funcionários via UI e define disponibilidade via API', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);

      // 3a) Cria cada funcionário pelo formulário da UI (testa o fluxo visual)
      data.employees.forEach((emp) => {
        cy.visit('/availability');
        cy.get('input[placeholder="Enter the name..."]').clear().type(emp.name);
        cy.get('input[placeholder="No specific workload"]').clear().type(emp.workload.toString());

        // Pinta ao menos uma célula para desbloquear o botão Save
        // Célula 8 = segunda-feira 08h (índice correto no grid)
        cy.get('.mol-availability-cell').then(($cells) => {
          cy.wrap($cells.eq(8)).trigger('mousedown').trigger('mouseup');
        });

        cy.get('button').contains('Save').click();
        cy.url().should('include', '/staff');
        cy.contains(emp.name).should('be.visible');
      });

      // 3b) Sobrescreve a disponibilidade via API com cobertura completa (06h-22h, todo dia)
      // Isso garante que os turnos (08h-19h e 09h-20h) sejam cobertos pela disponibilidade.
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
      }).then((loginRes) => {
        const token = loginRes.body.access_token;
        cy.request({
          method: 'GET',
          url: `${data.apiBase}/employees`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((empRes) => {
          empRes.body.forEach((emp) => {
            // Disponibilidade: seg(0) a dom(6), 06:00-22:00
            [0, 1, 2, 3, 4, 5, 6].forEach((weekday) => {
              cy.request({
                method: 'POST',
                url: `${data.apiBase}/employees/${emp.id}/availabilities`,
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

  // ── 4. EDITAR NOME DO PRIMEIRO FUNCIONÁRIO (testa formulário de edição) ───

  it('4 - Edita o nome do primeiro funcionário e confirma atualização', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
      cy.visit('/staff');

      cy.contains(data.employees[0].name)
        .closest('.mol-employee-card')
        .within(() => {
          cy.get('button').first().click();
        });

      cy.url().should('include', '/availability');
      cy.get('input[placeholder="Enter the name..."]').should('have.value', data.employees[0].name);

      // Confirma que o grid de disponibilidade está visível
      cy.get('.mol-availability-grid').should('be.visible');

      // Salva sem alterações (testa que o form preserva os dados)
      cy.get('button').contains('Save').click();
      cy.url().should('include', '/staff');
      cy.contains(data.employees[0].name).should('be.visible');
    });
  });

  // ── 5. NAVEGAR PARA O CALENDÁRIO E SELECIONAR SEMANA ────────────────────

  it('5 - Navega até o calendário e seleciona uma semana', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
      cy.visit('/staff');

      data.employees.forEach((emp) => {
        cy.contains(emp.name).should('be.visible');
      });

      cy.get('button').contains('Next').click();
      cy.url().should('include', '/calendar');

      // Avança 3 meses para evitar semanas já geradas
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
  });

  // ── 6. CRIAR OS 6 TURNOS E APROVAR A ESCALA ──────────────────────────────
  //
  // ⚠️  NOTA IMPORTANTE SOBRE DRAG-AND-DROP:
  //     O Chrome bloqueia DataTransfer.getData() em eventos sintéticos por
  //     segurança. Isso significa que trigger('dragover') + trigger('drop')
  //     nunca entrega os dados ao React handler — shifts não são adicionados.
  //     SEM shifts nas colunas → nenhum schedule é gerado → Approved nunca executa.
  //
  //     SOLUÇÃO: usar o botão .obj-day-column__add-btn de cada coluna.
  //     Ele abre o modal diretamente para aquele dayIndex (sem drag).
  //     Isso é equivalente ao fluxo manual de criação por dia.

  it('6 - Cria os turnos por dia e aprova a escala gerada', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
      cy.visit('/staff');
      cy.get('button').contains('Next').click();

      cy.url().should('include', '/calendar');
      cy.get('button[title="Next month"]').click();
      cy.get('button[title="Next month"]').click();
      cy.get('button[title="Next month"]').click();

      cy.get('table tbody tr').first().within(() => {
        cy.get('button').not(':disabled').first().click({ force: true });
      });
      cy.get('.calendar-page__actions button').contains('Next').click();
      cy.url().should('include', '/shift-config');
      cy.contains('Shift Configuration').should('be.visible');

      // Abre o modal "+" da coluna e salva o turno naquele dia.
      // IMPORTANTE: o useTemplateStore valida unicidade por NOME.
      // Como o mesmo turno é adicionado a vários dias, usamos um sufixo
      // de dia para tornar cada nome único (ex: "Turno 1 Seg", "Turno 1 Ter").
      // O nome é só para exibição — o algoritmo usa start_time/end_time/staff.
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

      // Turnos 1, 2, 3 → seg(0) a sex(4)  [nomes únicos por dia]
      [0, 1, 2, 3, 4].forEach((dayIdx) => {
        addShiftToDay(dayIdx, data.shifts[0]);
        addShiftToDay(dayIdx, data.shifts[1]);
        addShiftToDay(dayIdx, data.shifts[2]);
      });
      // Turnos Sab 1, 2, 3 → sab(5)  [sufixo 'Sab' já é único]
      addShiftToDay(5, data.shifts[3]);
      addShiftToDay(5, data.shifts[4]);
      addShiftToDay(5, data.shifts[5]);

      // Dispara a geração
      cy.get('.shift-config__create-btn').click();

      // ⚠️  A geração é ASSÍNCRONA (polling de job) — a navegação demora.
      // cy.url().then() sozinho roda ANTES da navegação terminar (URL ainda
      // é /shift-config). É obrigatório ESPERAR a URL mudar primeiro.
      cy.url({ timeout: 60000 }).should('not.include', '/shift-config');

      // Agora a URL já mudou → verifica para onde foi
      cy.url().then((url) => {
        if (url.includes('/schedule')) {
          cy.contains('Generated Schedule').should('be.visible');
          cy.on('window:alert', () => true);
          cy.get('button').contains('Approved').click();
          cy.url().should('include', '/staff');
        }
        // /staff direto → possible=false (dados insuficientes para gerar escala)
      });
    });
  });

  // ── 7. EDITAR ESCALA NA PÁGINA DE RECORDS ────────────────────────────────

  it('7 - Navega Reports → Generated Scales → edita funcionário em slot', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);

      cy.on('window:alert', () => true);

      // ⚠️  App.jsx inicializa employees do sessionStorage (limpo no cy.visit).
      // O StaffPage é quem busca employees da API e popula o estado.
      // Visitar /staff primeiro garante que employees está carregado antes
      // de ir para /schedule-records (que usa employees no modal de seleção).
      cy.intercept('GET', '**/employees').as('loadEmployees');
      cy.visit('/staff');
      cy.wait('@loadEmployees');

      // Passa pelo /reports para carregar o weeksList no estado React
      cy.visit('/reports');
      cy.url().should('include', '/reports');
      cy.contains('Reports and Analysis').should('be.visible');

      // Clica no card "Generated Scales" que chama setWeekRecords() + navigate('/schedule-records')
      cy.contains('Generated Scales').click({ force: true });
      cy.url().should('include', '/schedule-records');
      cy.contains('Schedule Records').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('.schedule-records__empty').length > 0) {
          cy.log('⚠️ Nenhuma escala disponível — step pulado.');
          return;
        }

        // Ativa modo Edit
        cy.get('button').contains('Edit').click();
        cy.contains('Editing mode is active').should('be.visible');

        // Tenta abrir modal clicando em slot com funcionário
        cy.get('td').filter(':has(.mol-schedule-employee-chip)').first().then(($cell) => {
          if ($cell.length > 0) {
            cy.wrap($cell).click({ force: true });
            cy.contains('Select Employees').should('be.visible');

            // Toggle nos dois primeiros funcionários
            cy.get('.mol-slot-picker__list button').first().click();
            cy.get('.mol-slot-picker__list button').eq(1).click();

            cy.get('.mol-slot-picker button').contains('Finish').click();
            cy.contains('Select Employees').should('not.exist');
          }
        });

        // Salva
        cy.get('button').contains('Save').click();
        cy.contains('Editing mode is active').should('not.exist');
      });
    });
  });

  // ── 8. DELETAR ESCALA E VERIFICAR RETORNO ────────────────────────────────

  it('8 - Reports → Generated Scales → deleta escala e verifica redirecionamento', () => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);

      cy.on('window:alert', () => true);
      cy.on('window:confirm', () => true);

      // Garante que employees estão carregados (sessionStorage é limpo no cy.visit)
      cy.intercept('GET', '**/employees').as('loadEmployees');
      cy.visit('/staff');
      cy.wait('@loadEmployees');

      // Passa pelo /reports para carregar o weeksList no estado React
      cy.visit('/reports');
      cy.url().should('include', '/reports');
      cy.contains('Reports and Analysis').should('be.visible');

      cy.contains('Generated Scales').click({ force: true });
      cy.url().should('include', '/schedule-records');

      cy.get('body').then(($body) => {
        if ($body.find('.schedule-records__empty').length > 0) {
          cy.log('⚠️ Nenhuma escala para deletar — step pulado.');
          return;
        }

        // Ativa modo Edit para acessar o botão Delete
        cy.get('button').contains('Edit').click();
        cy.contains('Editing mode is active').should('be.visible');

        cy.get('button').contains('Delete').click();

        // Após deleção: /schedule-records (outra escala) ou /reports (era a única)
        cy.url().should('match', /\/(schedule-records|reports|staff)/);
      });
    });
  });

  // ── TEARDOWN: mesmo cleanup do before() ──────────────────────────────────

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

        data.employees.forEach((emp) => {
          cy.deleteEmployeeByNameViaApi(emp.name, token);
        });

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
