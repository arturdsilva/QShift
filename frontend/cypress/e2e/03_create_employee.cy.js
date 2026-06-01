// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/03_create_employee.cy.js
// Fluxo: Criação de todos os funcionários com disponibilidade
// ─────────────────────────────────────────────────────────────────────────────

describe('Fluxo de Criação de Funcionários', () => {
  let testUser;
  let employees;

  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;
      employees = data.employees;
    });
  });

  beforeEach(() => {
    cy.fixture('mockData').then((data) => {
      cy.loginViaApi(data.testUser.email, data.testUser.password);
    });
  });

  it('deve exibir a página de gerenciamento de funcionários', () => {
    cy.visit('/staff');
    cy.contains('Employee Management').should('be.visible');
    cy.contains('Add New Employee').should('be.visible');
  });

  it('deve navegar para /availability ao clicar em "Add New Employee"', () => {
    cy.visit('/staff');
    cy.contains('Add New Employee').click();
    cy.url().should('include', '/availability');
    cy.contains('Employee availability').should('be.visible');
  });

  it('deve manter o botão Save desativado sem nome', () => {
    cy.visit('/availability');
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('deve habilitar o botão Save ao preencher o nome', () => {
    cy.visit('/availability');
    cy.get('input[placeholder="Enter the name..."]').type('Teste Temporário');
    cy.get('button').contains('Save').should('not.be.disabled');
  });

  it('deve navegar de volta para /staff ao cancelar', () => {
    cy.visit('/availability');
    cy.get('button').contains('Cancel').click();
    cy.url().should('include', '/staff');
  });

  // Cria cada um dos 5 funcionários definidos no fixture
  it('deve criar todos os funcionários com disponibilidade e redirecionar para /staff', () => {
    cy.fixture('mockData').then((data) => {
      data.employees.forEach((emp) => {
        cy.visit('/availability');

        // Preenche o nome
        cy.get('input[placeholder="Enter the name..."]').clear().type(emp.name);

        // Preenche workload
        cy.get('input[placeholder="No specific workload"]').clear().type(emp.workload.toString());

        // Pinta disponibilidade em alguns slots (segunda e terça-feira)
        cy.get('.mol-availability-cell').then(($cells) => {
          [1, 2, 3, 25, 26].forEach((idx) => {
            cy.wrap($cells.eq(idx)).trigger('mousedown').trigger('mouseup');
          });
        });

        // Salva e confirma retorno para /staff
        cy.get('button').contains('Save').click();
        cy.url().should('include', '/staff');
        cy.contains(emp.name).should('be.visible');
      });
    });
  });

  after(() => {
    // Remove todos os funcionários criados pelo teste
    cy.fixture('mockData').then((data) => {
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200) {
          data.employees.forEach((emp) => {
            cy.deleteEmployeeByNameViaApi(emp.name, res.body.access_token);
          });
        }
      });
    });
  });
});
