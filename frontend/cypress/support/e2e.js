// ─────────────────────────────────────────────────────────────────────────────
// cypress/support/e2e.js
// Ponto de entrada do suporte — importa os comandos customizados
// ─────────────────────────────────────────────────────────────────────────────
import './commands';

// Ignora erros do service worker do PWA e erros de template duplicado durante os testes
Cypress.on('uncaught:exception', (err) => {
  // Evita que erros do Vite HMR ou PWA derrubem o teste
  if (
    err.message.includes('ResizeObserver') ||
    err.message.includes('Service Worker') ||
    err.message.includes('Network Error') ||
    // Erro de template duplicado no IndexedDB — suprimido pois o before() já limpa o DB
    err.message.includes('já existe')
  ) {
    return false;
  }
  return true;
});
