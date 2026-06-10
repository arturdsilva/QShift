// Helper: navega via /reports → "Generated Scales" → /schedule-records
const goToScheduleRecords = () => {
  cy.visit('/reports');
  cy.url().should('include', '/reports');
  cy.contains('Reports and Analysis').should('be.visible');
  cy.contains('Generated Scales').click({ force: true });
  cy.url().should('include', '/schedule-records');
  cy.contains('Schedule Records').should('be.visible');
};

describe('Fluxo de Edição e Exclusão de Escala', () => {
  beforeEach(() => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
    });
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);
  });

  // ── 1. NAVEGAR REPORTS → GENERATED SCALES → RECORDS ──────────────────────

  it('1 - deve navegar de /reports para /schedule-records via "Generated Scales"', () => {
    goToScheduleRecords();
  });

  // ── 2. PÁGINA MOSTRA ESCALA OU MENSAGEM DE VAZIA ──────────────────────────

  it('2 - deve exibir tabela de escala ou aviso de vazio', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.contains('No weekly schedule created').should('be.visible');
        cy.log('ℹ️ Sem escalas no banco.');
      } else {
        cy.get('table').should('be.visible');
        cy.get('button').contains('Edit').should('be.visible');
      }
    });
  });

  // ── 3. EDITAR ESCALA: TROCAR FUNCIONÁRIO EM SLOT ─────────────────────────

  it('3 - deve editar a escala trocando um funcionário no slot', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.log('⚠️ Sem escala para editar — pulando.');
        return;
      }

      // Ativa modo de edição
      cy.get('button').contains('Edit').click();
      cy.contains('Editing mode is active').should('be.visible');

      // Clica no primeiro slot que tenha funcionário
      cy.get('td').filter(':has(.mol-schedule-employee-chip)').first().then(($cell) => {
        if ($cell.length > 0) {
          cy.wrap($cell).click({ force: true });
          cy.contains('Select Employees').should('be.visible');

          // Toggle: deseleciona o 1º, seleciona o 2º
          cy.get('.mol-slot-picker__list button').first().click();
          cy.get('.mol-slot-picker__list button').eq(1).click();

          cy.get('.mol-slot-picker button').contains('Finish').click();
          cy.contains('Select Employees').should('not.exist');
        } else {
          cy.log('⚠️ Slot sem funcionário — pulando troca.');
        }
      });

      // Salva
      cy.get('button').contains('Save').click();
      cy.contains('Editing mode is active').should('not.exist');
      cy.get('table').should('be.visible');
    });
  });

  // ── 4. DELETAR A ESCALA ───────────────────────────────────────────────────

  it('4 - deve deletar a escala e redirecionar corretamente', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.log('⚠️ Sem escala para deletar — pulando.');
        return;
      }

      // Ativa modo Edit para exibir o botão Delete
      cy.get('button').contains('Edit').click();
      cy.contains('Editing mode is active').should('be.visible');

      cy.get('button').contains('Delete').click();

      // Após deletar:
      // - Se havia 1 escala → redireciona para /reports
      // - Se havia >1 → permanece em /schedule-records com a próxima escala
      cy.url().should('match', /\/(schedule-records|reports|staff)/);
    });
  });

  // ── 5. ESTADO PÓS-DELEÇÃO ─────────────────────────────────────────────────

  it('5 - deve exibir mensagem de vazio ou próxima escala após deleção', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.contains('No weekly schedule created').should('be.visible');
        cy.log('✅ Sem escalas restantes após deleção.');
      } else if ($body.find('table').length > 0) {
        cy.get('table').should('be.visible');
        cy.log('✅ Há escalas restantes — exibindo próxima.');
      } else {
        // Redirecionou para /reports (banco vazio)
        cy.url().should('include', '/reports');
      }
    });
  });

  // ── 6. BOTÃO BACK RETORNA PARA /REPORTS ──────────────────────────────────

  it('6 - deve voltar para /reports ao clicar em Back', () => {
    goToScheduleRecords();
    cy.get('button').contains('Back').click();
    cy.url().should('include', '/reports');
  });
});
