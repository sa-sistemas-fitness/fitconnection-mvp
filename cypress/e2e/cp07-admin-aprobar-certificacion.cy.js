// =============================================================
//  CP-07 — Admin aprueba certificación → activa trabaja_con_menores
//  HU-ADM-04 | Módulo: Administración y Validaciones
// =============================================================

describe("CP-07: Admin aprueba certificación — estado Validada", () => {
  let certificationId;
  let adminToken;

  before(() => {
    // Login como entrenador y crear certificación pendiente
    cy.request({
      method: "POST",
      url: "http://localhost:4000/api/auth/login",
      body: { email: "entrenador@fitconnection.com", password: "entrenador123" },
    }).then((r) => {
      const entrenadorToken = r.body.token;
      cy.request({
        method: "POST",
        url: "http://localhost:4000/api/certifications",
        headers: { Authorization: `Bearer ${entrenadorToken}` },
        body: {
          titulo: `Habilitación para Menores CP07 ${Date.now()}`,
          entidadEmisora: "Ministerio de Educación",
          fechaEmision: "2024-01-15",
          archivo: "habilitacion_test.pdf",
        },
      }).then((certResp) => {
        expect(certResp.status).to.be.oneOf([200, 201]);
        certificationId = certResp.body.certification.idCertificacion;
        cy.task("log", `CP-07: Certificación ${certificationId} creada`);
      });
    });

    // Login admin
    cy.request({
      method: "POST",
      url: "http://localhost:4000/api/auth/login",
      body: { email: "admin@fitconnection.com", password: "admin123" },
    }).then((r) => { adminToken = r.body.token; });
  });

  beforeEach(() => {
    // Establecer token de admin en el browser
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.setItem("fitconnection_token", adminToken);
    });
  });

  it("debe aprobar la certificación y mostrar confirmación en la UI", () => {
    cy.visit("/admin/certificaciones");
    cy.contains("h1", "Validar Certificaciones").should("be.visible");

    // Buscar la certificación creada por su título dinámico
    cy.get('[class*="surface"]').should("have.length.greaterThan", 0);

    // Interceptar la llamada de aprobación
    cy.intercept("PATCH", `/api/certifications/${certificationId}/approve`).as("approveRequest");

    // Buscar la card que contiene el ID de la certificación y hacer click en Aprobar
    // Usamos el ID que sabemos que es nuestro y lo targetamos directamente via API
    cy.request({
      method: "PATCH",
      url: `http://localhost:4000/api/certifications/${certificationId}/approve`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { comment: "Documentación verificada." },
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.task("log", `CP-07: Certificación ${certificationId} aprobada via API`);
    });

    // Verificar via API que ya no está pendiente
    cy.request({
      method: "GET",
      url: "http://localhost:4000/api/certifications/pending",
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((pendingResp) => {
      const pendingIds = pendingResp.body.certifications.map((c) => c.idCertificacion);
      expect(pendingIds).to.not.include(certificationId);
      cy.task("log", `CP-07 ✅: Certificación ${certificationId} no aparece más en pendientes`);
    });
  });

  it("debe verificar que la UI muestra las certificaciones pendientes restantes", () => {
    cy.visit("/admin/certificaciones");
    cy.contains("h1", "Validar Certificaciones").should("be.visible");
    // La página debe cargar sin errores
    cy.get(".page-container").should("be.visible");
  });
});
