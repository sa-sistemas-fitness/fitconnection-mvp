// =============================================================
//  CP-08 — Admin rechaza certificación con motivo
//  HU-ADM-04 | Módulo: Administración y Validaciones
// =============================================================

describe("CP-08: Admin rechaza certificación — estado Rechazado con motivo", () => {
  const timestamp = Date.now();
  const certTitle = `Certificación Ilegible Test ${timestamp}`;
  let certificationId;
  let entrenadorToken;

  before(() => {
    // Crear una certificación pendiente como entrenador para rechazarla
    cy.request({
      method: "POST",
      url: "http://localhost:4000/api/auth/login",
      body: { email: "entrenador@fitconnection.com", password: "entrenador123" },
    }).then((response) => {
      entrenadorToken = response.body.token;

      cy.request({
        method: "POST",
        url: "http://localhost:4000/api/certifications",
        headers: { Authorization: `Bearer ${entrenadorToken}` },
        body: {
          titulo: certTitle,
          entidadEmisora: "Instituto Ejemplo",
          fechaEmision: "2023-06-01",
          archivo: "certificacion_corrupta.pdf",
        },
      }).then((certResponse) => {
        expect(certResponse.status).to.be.oneOf([200, 201]);
        certificationId = certResponse.body.certification.idCertificacion;
        cy.task("log", `Certificación a rechazar creada con ID: ${certificationId}`);
      });
    });
  });

  beforeEach(() => {
    cy.fixture("users").then((users) => {
      cy.loginByApi(users.admin.email, users.admin.password);
    });
  });

  it("debe rechazar la certificación con motivo y mostrar confirmación", () => {
    cy.visit("/admin/certificaciones");

    cy.contains("h1", "Validar Certificaciones").should("be.visible");

    // Buscar la certificación ilegible
    cy.contains(certTitle).should("be.visible");

    // Interceptar la llamada de rechazo
    cy.intercept("PATCH", `/api/certifications/${certificationId}/reject`).as("rejectRequest");

    // Hacer clic en "Rechazar" dentro de la card correspondiente
    cy.contains(certTitle)
      .parents('[class*="surface"]')
      .first()
      .contains("button", "Rechazar")
      .click();

    // Verificar que el modal de rechazo se abrió
    cy.contains("Rechazar certificación").should("be.visible");

    // Ingresar el motivo de rechazo
    const motivoRechazo =
      "El archivo adjunto es ilegible. Por favor, volvé a subir el documento con mayor resolución.";
    cy.get("textarea").type(motivoRechazo);

    // Confirmar el rechazo
    cy.contains("button", "Confirmar rechazo").click();

    // Esperar la respuesta de la API
    cy.wait("@rejectRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // Verificar mensaje de éxito en la UI
    cy.get('[class*="emerald"]').should("be.visible").and("contain", "fue rechazada");

    // La certificación ya no debe aparecer en pendientes (en el listado)
    cy.contains("h2", certTitle).should("not.exist");
  });
});
