// =============================================================
//  CP-06 — Acceso a ruta protegida sin autenticación
//  HU-CLI-04 | Módulo: FinTech y Pagos (control de acceso)
// =============================================================
//
//  Equivalente al CP-06 del documento que menciona "/checkout/:id".
//  En la app real, la ruta de pagos está en /turnos (ProtectedRoute).
//  Sin token JWT en localStorage → el guard redirige a /login.

describe("CP-06: Acceso a ruta protegida sin autenticación → redirección al login", () => {
  it("debe redirigir a /login cuando no hay sesión activa al acceder a /turnos", () => {
    // Asegurarse de que localStorage esté limpio (sin token)
    cy.clearLocalStorage();

    // Intentar acceder directamente a la ruta protegida de turnos/pagos
    cy.visit("/turnos");

    // El ProtectedRoute de React Router debe redirigir a /login
    cy.url().should("include", "/login");

    // Verificar que la página de login está visible
    cy.contains("Ingresá a FitConnection").should("be.visible");

    // Verificar que NO se renderiza el contenido de la página de turnos
    cy.contains("Mis Turnos").should("not.exist");
  });

  it("debe redirigir a /login al acceder a /panel sin sesión", () => {
    cy.clearLocalStorage();
    cy.visit("/panel");
    cy.url().should("include", "/login");
  });

  it("debe preservar la URL de destino en el estado de redirección", () => {
    cy.clearLocalStorage();
    cy.visit("/turnos");
    cy.url().should("include", "/login");

    // Después de hacer login, debe redirigir de vuelta a /turnos
    cy.fixture("users").then((users) => {
      cy.get('input[type="email"]').clear().type(users.cliente.email);
      cy.get('input[type="password"]').clear().type(users.cliente.password);
      cy.contains("button", "Ingresar").click();
      // Verifica que vuelve a la ruta original
      cy.url().should("include", "/turnos");
    });
  });
});
