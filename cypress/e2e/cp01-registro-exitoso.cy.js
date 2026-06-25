// =============================================================
//  CP-01 — Registro exitoso con datos válidos
//  HU-USU-01 | Módulo: Gestión de Usuarios y Autenticación
// =============================================================

describe("CP-01: Registro exitoso con datos válidos", () => {
  // Generamos email único para evitar colisiones con registros anteriores
  const timestamp = Date.now();
  const user = {
    nombre: "Juan",
    apellido: "García",
    email: `juan.garcia.${timestamp}@mail.com`,
    dni: `${30000000 + (timestamp % 9999999)}`,
    password: "Pwd1234!",
    ubicacion: "Buenos Aires",
  };

  it("debe redirigir al panel del cliente tras un registro exitoso", () => {
    cy.visit("/registro");

    // Completar formulario
    cy.get('input[name="nombre"]').type(user.nombre);
    cy.get('input[name="apellido"]').type(user.apellido);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="dni"]').type(user.dni);
    cy.get('input[name="password"]').type(user.password);
    cy.get('input[name="ubicacion"]').type(user.ubicacion);

    // Interceptar la llamada a la API antes de hacer click
    cy.intercept("POST", "/api/auth/register").as("registerRequest");

    cy.contains("button", "Crear cuenta").click();

    // Verificar que la API fue llamada con status 201
    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);

    // Verificar redirección al panel del cliente
    cy.url().should("include", "/panel");

    // Verificar que el panel del cliente está visible (no el de admin)
    cy.contains("FitConnection").should("be.visible");
  });
});
