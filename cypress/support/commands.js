// =============================================================
//  FitConnection — Cypress Custom Commands
// =============================================================

const TOKEN_KEY = "fitconnection_token";
const API_URL = "http://localhost:4000";

// ----- Login via UI (para tests que verifican el flujo de login) -----
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  // El formulario de login tiene valores por defecto — los limpiamos primero
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.contains("button", "Ingresar").click();
  cy.url().should("include", "/panel");
});

// ----- Login via API (rápido, sin pasar por UI — para tests que NO testean login) -----
Cypress.Commands.add("loginByApi", (email, password) => {
  cy.request({
    method: "POST",
    url: `${API_URL}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: true,
  }).then(({ body }) => {
    // Visitar la app primero para que el localStorage exista en el contexto correcto
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.setItem(TOKEN_KEY, body.token);
    });
  });
});

// ----- Shortcut: seleccionar por data-testid -----
Cypress.Commands.add("getByTestId", (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// ----- Hacer un request autenticado usando el token almacenado -----
Cypress.Commands.add("apiRequest", (method, path, body = null) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  return cy.request({
    method,
    url: `${API_URL}/api${path}`,
    headers: { Authorization: `Bearer ${token}` },
    body: body || undefined,
    failOnStatusCode: false,
  });
});
