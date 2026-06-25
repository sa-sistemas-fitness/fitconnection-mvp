// =============================================================
//  CP-04 — Pago exitoso de turno reservado
//  HU-CLI-04 | Módulo: FinTech y Pagos
// =============================================================
//
//  Usa cy.intercept() para mockear la respuesta de la API de pagos,
//  lo que hace el test completamente independiente del estado de la BD.
//  Esto es correcto para un test E2E que verifica el comportamiento
//  de la UI ante una respuesta exitosa de la pasarela.

describe("CP-04: Pago exitoso — turno reservado", () => {
  beforeEach(() => {
    // Login via API
    cy.request({
      method: "POST",
      url: "http://localhost:4000/api/auth/login",
      body: { email: "cliente@fitconnection.com", password: "cliente123" },
    }).then(({ body }) => {
      cy.visit("/");
      cy.window().then((win) => {
        win.localStorage.setItem("fitconnection_token", body.token);
      });
    });
  });

  it("debe procesar el pago exitosamente y mostrar mensaje de aprobación", () => {
    // Mock: interceptar el POST de pagos y retornar respuesta de éxito
    cy.intercept("POST", "/api/payments", {
      statusCode: 201,
      body: {
        payment: {
          idPago: 999,
          idTurno: 1,
          monto: 5000,
          descuento: 0,
          metodoPago: "Tarjeta simulada",
          estado: { nombre: "Aprobado" },
        },
      },
    }).as("paymentRequest");

    // Mock: interceptar GET de pagos para que el turno aparezca como "Reservado" sin pago
    cy.intercept("GET", "/api/payments/my", {
      statusCode: 200,
      body: { payments: [] },
    }).as("getPayments");

    // Mock: interceptar GET de turnos para que aparezca un turno reservado
    cy.intercept("GET", "/api/turns/my", {
      statusCode: 200,
      body: {
        turns: [
          {
            idTurno: 1,
            idEntrenador: 1,
            tarifa: 5000,
            fechaInicio: "2026-07-01",
            fechaFin: "2026-07-01",
            fechaSolicitud: "2026-06-25T15:00:00.000Z",
            horaInicio: "10:00",
            horaFin: "11:00",
            modalidad: "Presencial",
            observaciones: "Sesión de prueba CP-04",
            estado: { nombre: "Reservado" },
            entrenador: {
              usuario: { nombre: "Carlos", apellido: "Trainer" },
              especialidades: [],
            },
          },
        ],
      },
    }).as("getTurns");

    cy.visit("/turnos");
    cy.contains("h1", "Mis Turnos").should("be.visible");

    // Ir a la pestaña "Reservados"
    cy.contains("button", "Reservados").click();

    // Abrir modal de pago
    cy.contains("button", "Pagar").first().click();
    cy.contains("Pago simulado").should("be.visible");

    // Verificar que el resultado por defecto es "Aprobado"
    cy.contains("Resultado de la simulación")
      .parent()
      .find("select")
      .should("have.value", "Aprobado");

    // Confirmar el pago
    cy.contains("button", "Confirmar Pago").click();

    // Esperar la llamada a la API
    cy.wait("@paymentRequest").its("response.statusCode").should("eq", 201);

    // Verificar mensaje de éxito en la UI
    cy.contains("Pago simulado aprobado").should("be.visible");
  });
});
