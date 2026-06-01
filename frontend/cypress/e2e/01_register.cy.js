// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/01_register.cy.js
// Fluxo: Registro de novo usuário
// ─────────────────────────────────────────────────────────────────────────────

describe('Fluxo de Registro', () => {
  let testUser;

  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;
      // Garante que o usuário não existe antes de testar o registro
      cy.deleteTestUserViaApi(testUser.email, testUser.password);
    });
  });

  it('deve exibir o formulário de registro corretamente', () => {
    cy.visit('/register');
    cy.contains('h3', 'Register').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#confirm-email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Register');
  });

  it('deve exibir erro quando emails não coincidem', () => {
    cy.visit('/register');
    cy.get('#email').type(testUser.email);
    cy.get('#confirm-email').type('outro@email.com');
    cy.get('#password').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains('Emails do not match').should('be.visible');
    // Confirma que não saiu da página
    cy.url().should('include', '/register');
  });

  it('deve exibir erro quando campos estão vazios', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.contains('Please fill in all fields').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('deve registrar novo usuário com sucesso e redirecionar para /login', () => {
    cy.visit('/register');
    cy.get('#email').type(testUser.email);
    cy.get('#confirm-email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.get('button[type="submit"]').click();
    // Após registro bem-sucedido, deve redirecionar para login
    cy.url().should('include', '/login');
  });

  it('deve exibir link para tela de login', () => {
    cy.visit('/register');
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});
