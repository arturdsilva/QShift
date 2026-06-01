// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/06_edit_approve_schedule.cy.js
//
// Fluxo real do usuário:
//   /reports → clica em "Generated Scales" → /schedule-records
//   → modo Edit → clica em slot → modal de troca de funcionário
//   → salva → (opcional) aprova via GeneratedSchedule
//
// Pré-requisito: usuário de teste deve ter pelo menos 1 escala aprovada.
// ─────────────────────────────────────────────────────────────────────────────

// Helper reutilizável: vai para /reports, clica em "Generated Scales" e aguarda /schedule-records
const goToScheduleRecords = () => {
  cy.visit('/reports');
  cy.url().should('include', '/reports');
  cy.contains('Reports and Analysis').should('be.visible');
  // O card "Generated Scales" carrega o weeksList e navega para /schedule-records
  cy.contains('Generated Scales').click({ force: true });
  cy.url().should('include', '/schedule-records');
  cy.contains('Schedule Records').should('be.visible');
};

describe('Fluxo de Edição e Aprovação de Escala', () => {
  beforeEach(() => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
    });
    cy.on('window:alert', () => true);
  });

  // ── TESTE 1: /schedule sem estado redireciona para /staff ─────────────────

  it('1 - deve redirecionar para /staff ao acessar /schedule sem escala gerada', () => {
    cy.visit('/schedule');
    cy.url().should('include', '/staff');
  });

  // ── TESTE 2: Reports → Generated Scales → /schedule-records ──────────────

  it('2 - deve navegar de /reports para /schedule-records via card "Generated Scales"', () => {
    goToScheduleRecords();
  });

  // ── TESTE 3: /schedule-records mostra a escala ou mensagem de vazia ───────

  it('3 - deve exibir tabela de escala ou mensagem de vazio', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.contains('No weekly schedule created').should('be.visible');
      } else {
        cy.get('table').should('be.visible');
        cy.get('button').contains('Edit').should('be.visible');
      }
    });
  });

  // ── TESTE 4: abrir modal de seleção de funcionários em modo Edit ──────────

  it('4 - deve abrir o modal de seleção ao clicar em slot no modo Edit', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.log('⚠️ Sem escala — pulando teste.');
        return;
      }

      cy.get('button').contains('Edit').click();
      cy.contains('Editing mode is active').should('be.visible');

      // Clica no primeiro slot com funcionário atribuído
      cy.get('td').filter(':has(.mol-schedule-employee-chip)').first().click({ force: true });

      cy.contains('Select Employees').should('be.visible');
      cy.get('.mol-slot-picker').should('be.visible');

      // Fecha sem alterar
      cy.get('.mol-slot-picker button').contains('Finish').click();
      cy.contains('Select Employees').should('not.exist');
    });
  });

  // ── TESTE 5: trocar funcionários no slot e salvar ─────────────────────────

  it('5 - deve trocar funcionários no slot e salvar as alterações', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.log('⚠️ Sem escala — pulando teste.');
        return;
      }

      // Ativa modo de edição
      cy.get('button').contains('Edit').click();
      cy.contains('Editing mode is active').should('be.visible');

      // Clica no primeiro slot que tenha funcionário
      cy.get('td').filter(':has(.mol-schedule-employee-chip)').first().click({ force: true });
      cy.contains('Select Employees').should('be.visible');

      // Toggle: deseleciona o primeiro, seleciona o segundo
      cy.get('.mol-slot-picker__list button').first().click();
      cy.get('.mol-slot-picker__list button').eq(1).click();

      cy.get('.mol-slot-picker button').contains('Finish').click();
      cy.contains('Select Employees').should('not.exist');

      // Salva
      cy.get('button').contains('Save').click();
      cy.contains('Editing mode is active').should('not.exist');
      cy.get('table').should('be.visible');
    });
  });

  // ── TESTE 6: botões de ação estão presentes ───────────────────────────────

  it('6 - deve exibir botões Edit, Back e Export CSV', () => {
    goToScheduleRecords();

    cy.get('body').then(($body) => {
      if ($body.find('.schedule-records__empty').length > 0) {
        cy.get('button').contains('Back').should('be.visible');
        return;
      }
      cy.get('button').contains('Edit').should('be.visible');
      cy.get('button').contains('Back').should('be.visible');
      cy.get('button').contains('Export CSV').should('be.visible');
    });
  });

  // ── TESTE 7: botão Back retorna para /reports ─────────────────────────────

  it('7 - deve voltar para /reports ao clicar em Back', () => {
    goToScheduleRecords();
    cy.get('button').contains('Back').click();
    cy.url().should('include', '/reports');
  });
});
