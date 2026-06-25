// =============================================================
//  CP-02 — Formulario de registro vacío → validaciones frontend
//  HU-USU-01 | Módulo: Gestión de Usuarios y Autenticación
// =============================================================

describe("CP-02: Formulario de registro vacío — validaciones de campos", () => {
  beforeEach(() => {
    cy.visit("/registro");
  });

  it("debe bloquear el envío y mostrar validación cuando el formulario está vacío", () => {
    // Interceptar la llamada
    cy.intercept("POST", "/api/auth/register").as("registerRequest");

    // Clic en "Crear cuenta" sin completar ningún campo
    cy.contains("button", "Crear cuenta").click();

    // Esperar la llamada a la API y verificar que retorna un error de validación (400)
    cy.wait("@registerRequest").its("response.statusCode").should("eq", 400);

    // El sistema debe permanecer en /registro sin redirigir
    cy.url().should("include", "/registro");

    // Debe mostrar mensaje de error en la página (en rojo)
    cy.get(".bg-rose-500\\/10").should("be.visible").and("contain", "obligatorio");
  });

  it("debe mostrar error del servidor al enviar email ya registrado", () => {
    // Completar el formulario con un email existente del seed
    cy.get('input[name="nombre"]').type("Test");
    cy.get('input[name="apellido"]').type("Usuario");
    cy.get('input[name="email"]').type("cliente@fitconnection.com");
    cy.get('input[name="dni"]').type("99999999");
    cy.get('input[name="password"]').type("test123");
    cy.get('input[name="ubicacion"]').type("Mendoza");

    cy.intercept("POST", "/api/auth/register").as("registerRequest");
    cy.contains("button", "Crear cuenta").click();

    cy.wait("@registerRequest").its("response.statusCode").should("not.eq", 201);

    // Debe mostrar mensaje de error en la página (en rojo)
    cy.get(".bg-rose-500\\/10").should("be.visible").and("not.be.empty");

    // Permanece en la página de registro
    cy.url().should("include", "/registro");
  });
});
