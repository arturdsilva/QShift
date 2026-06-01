// ─────────────────────────────────────────────────────────────────────────────
// cypress/support/commands.js
// Custom Cypress commands reutilizáveis em todos os specs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * cy.login(email, password)
 * Faz login via UI e aguarda redirecionamento para /staff
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').clear().type(email);
  cy.get('#password').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/staff');
});

/**
 * cy.loginViaApi(email, password)
 * Faz login direto pela API (sem UI) e salva o token no localStorage.
 * Útil como setup rápido antes de testar outras páginas.
 */
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8000/api/v1/auth/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.access_token) {
      window.localStorage.setItem('token', response.body.access_token);
    }
  });
});

/**
 * cy.register(email, password)
 * Faz registro via UI
 */
Cypress.Commands.add('register', (email, password) => {
  cy.visit('/register');
  cy.get('#email').clear().type(email);
  cy.get('#confirm-email').clear().type(email);
  cy.get('#password').clear().type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * cy.deleteTestUserViaApi(email, password)
 * Remove o usuário de teste via API para garantir isolamento entre runs.
 * Ignora erros (usuário pode não existir ainda).
 */
Cypress.Commands.add('deleteTestUserViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8000/api/v1/auth/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.access_token) {
      cy.request({
        method: 'DELETE',
        url: 'http://localhost:8000/api/v1/users/me',
        headers: { Authorization: `Bearer ${response.body.access_token}` },
        failOnStatusCode: false,
      });
    }
  });
});

/**
 * cy.deleteEmployeeByNameViaApi(name, token)
 * Remove funcionários criados pelo teste via API.
 */
Cypress.Commands.add('deleteEmployeeByNameViaApi', (name, token) => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:8000/api/v1/employees',
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200) {
      const employee = res.body.find((e) => e.name === name);
      if (employee) {
        cy.request({
          method: 'DELETE',
          url: `http://localhost:8000/api/v1/employees/${employee.id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      }
    }
  });
});
/**
 * cy.clearTemplatesDB()
 * Apaga o banco IndexedDB 'qshift-templates' do browser.
 * Deve ser chamado no before() de qualquer spec que cria templates de turno,
 * garantindo que não haja conflito de nomes entre runs.
 */
Cypress.Commands.add('clearTemplatesDB', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve, reject) => {
      const req = win.indexedDB.deleteDatabase('qshift-templates');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => {
        // Banco bloqueado por uma aba aberta — ainda assim resolve
        // para não travar o teste; o Cypress vai recarregar a página antes do teste
        resolve();
      };
    });
  });
});
