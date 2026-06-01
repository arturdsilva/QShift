// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/04_edit_availability.cy.js
// Fluxo: Edição de disponibilidade de um funcionário existente
// ─────────────────────────────────────────────────────────────────────────────

describe('Fluxo de Edição de Disponibilidade', () => {
  let testUser;
  let employeeName;
  let createdEmployeeId;

  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;
      employeeName = `${data.employees[0].name} Edit`;

      // Cria um funcionário via API para usar nos testes de edição
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
      }).then((loginRes) => {
        const token = loginRes.body.access_token;
        window.localStorage.setItem('token', token);

        cy.request({
          method: 'POST',
          url: 'http://localhost:8000/api/v1/employees',
          headers: { Authorization: `Bearer ${token}` },
          body: { name: employeeName, active: true },
        }).then((empRes) => {
          createdEmployeeId = empRes.body.id;

          // Adiciona uma disponibilidade inicial via API
          cy.request({
            method: 'POST',
            url: `${data.apiBase}/employees/${createdEmployeeId}/availabilities`,
            headers: { Authorization: `Bearer ${token}` },
            body: { weekday: 0, start_time: '08:00', end_time: '12:00' },
            failOnStatusCode: false,
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

  it('deve exibir botão de edição no card do funcionário', () => {
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        // Botão de editar (ícone de lápis)
        cy.get('button').first().should('be.visible');
      });
  });

  it('deve navegar para /availability ao clicar em editar', () => {
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.url().should('include', '/availability');
  });

  it('deve carregar o nome do funcionário no formulário de edição', () => {
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.url().should('include', '/availability');
    cy.get('input[placeholder="Enter the name..."]').should('have.value', employeeName);
  });

  it('deve permitir alterar o nome e salvar', () => {
    const updatedName = `${employeeName} Updated`;
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.url().should('include', '/availability');

    // Altera o nome
    cy.get('input[placeholder="Enter the name..."]').clear().type(updatedName);
    cy.get('button').contains('Save').click();

    cy.url().should('include', '/staff');
    cy.contains(updatedName).should('be.visible');

    // Restaura o nome para não quebrar outros testes
    cy.visit('/staff');
    cy.contains(updatedName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.get('input[placeholder="Enter the name..."]').clear().type(employeeName);
    cy.get('button').contains('Save').click();
  });

  it('deve carregar a disponibilidade existente na tabela', () => {
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.url().should('include', '/availability');
    // O grid de disponibilidade deve estar visível (é um CSS Grid, não uma <table>)
    cy.get('.mol-availability-grid').should('be.visible');
  });

  it('deve toggle de ativo/inativo funcionar na edição', () => {
    cy.visit('/staff');
    cy.contains(employeeName)
      .closest('.mol-employee-card')
      .within(() => {
        cy.get('button').first().click();
      });
    cy.url().should('include', '/availability');
    // O checkbox de status deve estar visível
    cy.get('input[type="checkbox"]').should('exist');
    cy.get('input[type="checkbox"]').check({ force: true });
    cy.get('input[type="checkbox"]').should('be.checked');
  });

  after(() => {
    // Remove o funcionário de teste
    cy.fixture('mockData').then((data) => {
      cy.request({
        method: 'POST',
        url: `${data.apiBase}/auth/login`,
        body: { email: data.testUser.email, password: data.testUser.password },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status === 200 && createdEmployeeId) {
          cy.request({
            method: 'DELETE',
            url: `${data.apiBase}/employees/${createdEmployeeId}`,
            headers: { Authorization: `Bearer ${res.body.access_token}` },
            failOnStatusCode: false,
          });
        }
      });
    });
  });
});
