// =============================================================
//  CP-09 — Cliente intenta acceder a ruta de administración
//  HU-ADM-04 | Módulo: Administración y Validaciones (RBAC)
// =============================================================
//
//  Un usuario con rol "Cliente" no debe poder acceder a /admin/*.
//  El RoleRoute de React Router detecta el rol y redirige a /panel.
//  Equivalente al CP-09 del doc que describe HTTP 403 + redirect.

describe("CP-09: Cliente intenta acceder a ruta de admin → redirección al dashboard", () => {
  beforeEach(() => {
    // Login como cliente (NO tiene rol Administrador)
    cy.fixture("users").then((users) => {
      cy.loginByApi(users.cliente.email, users.cliente.password);
    });
  });

  it("debe redirigir al panel del cliente al intentar acceder a /admin/certificaciones", () => {
    // Navegar forzadamente a la ruta de admin
    cy.visit("/admin/certificaciones");

    // El RoleRoute detecta que el usuario no tiene rol "Administrador"
    // y redirige a /panel (dashboard del cliente)
    cy.url().should("include", "/panel");
    cy.url().should("not.include", "/admin");

    // Verificar que NO se renderiza el contenido de admin
    cy.contains("Validar Certificaciones").should("not.exist");

    // Verificar que sí se renderiza el dashboard del cliente
    cy.get("body").should("not.contain", "ADMIN");
  });

  it("debe redirigir al panel al intentar acceder a /admin/usuarios", () => {
    cy.visit("/admin/usuarios");
    cy.url().should("include", "/panel");
    cy.url().should("not.include", "/admin");
  });

  it("debe redirigir al panel al intentar acceder a /admin/pagos", () => {
    cy.visit("/admin/pagos");
    cy.url().should("include", "/panel");
    cy.url().should("not.include", "/admin");
  });

  it("debe verificar via API que un cliente recibe 403 al llamar endpoints de admin", () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem("fitconnection_token");

      // Intentar llamar un endpoint exclusivo de admin
      cy.request({
        method: "GET",
        url: "http://localhost:4000/api/certifications/pending",
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((response) => {
        // Debe devolver 403 Forbidden (el rol no es Administrador)
        expect(response.status).to.eq(403);
      });
    });
  });
});
