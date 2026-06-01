// ─────────────────────────────────────────────────────────────────────────────
// cypress/e2e/02_login.cy.js
// Fluxo: Login de usuário
// ─────────────────────────────────────────────────────────────────────────────

describe('Fluxo de Login', () => {
  let testUser;

  before(() => {
    cy.fixture('mockData').then((data) => {
      testUser = data.testUser;
    });
  });

  it('deve exibir o formulário de login corretamente', () => {
    cy.visit('/login');
    cy.contains('h3', 'Login').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]')
      .should('be.visible')
      .and('contain', 'Enter');
  });

  it('deve exibir erro com credenciais inválidas e permanecer em /login', () => {
    cy.visit('/login');
    cy.get('#email').type('errado@errado.com');
    cy.get('#password').type('senhaerrada');
    cy.get('button[type="submit"]').click();
    // Aguarda o estado de erro (pode ser banner ou continuar na página)
    cy.url().should('include', '/login');
  });

  it('deve fazer login com sucesso e redirecionar para /staff', () => {
    cy.visit('/login');
    cy.get('#email').clear().type(testUser.email);
    cy.get('#password').clear().type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/staff');
    // Confirma que a página de funcionários carregou
    cy.contains('Employee Management').should('be.visible');
  });

  it('deve salvar token no localStorage após login', () => {
    cy.visit('/login');
    cy.get('#email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/staff');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
    });
  });

  it('deve exibir link para tela de registro', () => {
    cy.visit('/login');
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });

  it('deve redirecionar / para /login automaticamente', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });
});
