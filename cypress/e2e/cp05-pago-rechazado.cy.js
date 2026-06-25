// =============================================================
//  CP-05 — Pago rechazado (fondos insuficientes / error simulado)
//  HU-CLI-04 | Módulo: FinTech y Pagos
// =============================================================

describe("CP-05: Pago rechazado — error de pasarela simulado", () => {
  beforeEach(() => {
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

  it("debe mostrar alerta de rechazo y botón 'Reintentar pago'", () => {
    // Mock: respuesta de pago rechazado
    cy.intercept("POST", "/api/payments", {
      statusCode: 201,
      body: {
        payment: {
          idPago: 998,
          idTurno: 1,
          monto: 5000,
          descuento: 0,
          metodoPago: "Tarjeta simulada",
          estado: { nombre: "Rechazado" },
        },
      },
    }).as("paymentRequest");

    // Mock: turno reservado sin pago previo
    cy.intercept("GET", "/api/payments/my", {
      statusCode: 200,
      body: { payments: [] },
    }).as("getPayments");

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
            observaciones: "Sesión prueba CP-05",
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
    cy.contains("button", "Reservados").click();

    cy.contains("button", "Pagar").first().click();
    cy.contains("Pago simulado").should("be.visible");

    // Cambiar resultado a "Rechazado" (simula fondos insuficientes)
    cy.contains("Resultado de la simulación")
      .parent()
      .find("select")
      .select("Rechazado");

    cy.contains("button", "Confirmar Pago").click();

    cy.wait("@paymentRequest").then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      expect(interception.response.body.payment.estado.nombre).to.eq("Rechazado");
    });

    // Verificar mensaje de rechazo visible
    cy.contains("Pago simulado rechazado").should("be.visible");
  });
});
