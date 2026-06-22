# Mapeo de historias de usuario y archivos

Este documento registra la primera incorporación de cada archivo al historial.
Un archivo compartido se confirma una sola vez y las historias posteriores
declaran su dependencia para evitar duplicaciones artificiales.

| Historia | Funcionalidad | Archivos backend | Archivos frontend | Dependencias |
| --- | --- | --- | --- | --- |
| CFG-01 | Estructura y configuración del repositorio | `backend/package*.json`, `.env.example`, configuración Prisma, `src/config`, `src/errors`, `src/lib`, `src/utils`, `src/server.js` | `frontend/package*.json`, `.env.example` | Base para todos los commits |
| BD-01 | Modelo Prisma, migración SQLite y seed | `prisma/schema.sqlite.prisma`, `prisma/migrations`, `prisma/seed.js` | — | CFG-01 |
| SEG-01 | Roles, permisos, auditoría y seguridad base | `middleware/auth.js`, `middleware/error-handler.js`, `services/audit.service.js` | — | CFG-01, BD-01 |
| UI-01 | React, Vite, estilos y navegación base | — | `index.html`, configuración Vite/Tailwind/PostCSS, `src/main.jsx`, `src/index.css`, componentes base de layout y UI, `LandingPage.jsx` | CFG-01 |
| HU-USU-01 | Registro de usuario | `controllers/auth.controller.js` | formulario de registro en `AuthPages.jsx` | BD-01, SEG-01, UI-01 |
| HU-USU-02 | Inicio de sesión | `routes/auth.routes.js` | `context/AuthContext.jsx` | HU-USU-01 |
| HU-USU-03 | Recuperación de contraseña | `services/auth.service.js`, `services/email.service.js` | flujos de recuperación en `AuthPages.jsx` ya incorporado | HU-USU-01, HU-USU-02 |
| HU-USU-04 | Edición de perfil | actualización en `controllers/trainer.controller.js` | `TrainerProfessionalProfilePage.jsx` | HU-USU-02; el MVP edita el perfil profesional |
| HU-USU-05 | Postulación como entrenador | alta en `routes/trainer.routes.js` | `TrainerApplicationForm.jsx`, `TrainerPortalPage.jsx` | HU-USU-02, HU-USU-04 |
| HU-USU-06 | Presentación de certificaciones | `controllers/certification.controller.js`, `routes/certification.routes.js`, `services/certification.service.js` | `TrainerCertificationsPage.jsx` | HU-USU-05 |
| HU-USU-07 | Perfil público del entrenador | consulta en `services/trainer.service.js` | `TrainerProfilePage.jsx`, `TrainerAvatar.jsx` | HU-USU-04, HU-USU-06 |
| HU-USU-08 | Mensajería | `controllers/chat.controller.js`, `routes/chat.routes.js`, `services/chat.service.js` | `ChatPage.jsx` | HU-CLI-06, HU-ENTR-05 |
| HU-CLI-01 | Búsqueda de entrenadores | `controllers/specialty.controller.js`, `routes/specialty.routes.js` | `MarketplacePage.jsx` | HU-USU-07 |
| HU-CLI-02 | Filtros de búsqueda | filtrado en `services/trainer.service.js` ya incorporado | `TrainerCard.jsx`, filtros en `MarketplacePage.jsx` ya incorporado | HU-CLI-01 |
| HU-CLI-03 | Solicitud de turno | `controllers/turn.controller.js` | `MyTurnsPage.jsx` | HU-CLI-06, HU-ENTR-01 |
| HU-CLI-04 | Pago de sesiones | `controllers/payment.controller.js`, `routes/payment.routes.js`, `services/payment.service.js` | flujo de pago en `MyTurnsPage.jsx` ya incorporado | HU-CLI-03 |
| HU-CLI-05 | Calificación de entrenador | `controllers/review.controller.js`, `routes/review.routes.js`, `services/review.service.js` | calificación en `MyTurnsPage.jsx` ya incorporado | HU-CLI-04 |
| HU-CLI-06 | Solicitud de conexión | `controllers/connection.controller.js`, `services/connection.service.js` | solicitud en `TrainerProfilePage.jsx` y resumen en `ClientDashboardPage.jsx` | HU-USU-07 |
| HU-ENTR-01 | Gestión de disponibilidad | consulta de turnos mediante `turn.service.js` | `TrainerAvailabilityPage.jsx` | HU-USU-05 |
| HU-ENTR-02 | Modificación de disponibilidad | — | persistencia local en `TrainerAvailabilityPage.jsx` ya incorporado, acceso en `Navbar.jsx` | HU-ENTR-01 |
| HU-ENTR-03 | Bloqueo de horarios | — | eliminación/bloqueo local en `TrainerAvailabilityPage.jsx` ya incorporado, ruta en `App.jsx` | HU-ENTR-01, HU-ENTR-02 |
| HU-ENTR-04 | Visualización de pagos | consulta en `payment.service.js` ya incorporado | `TrainerPaymentsPage.jsx` | HU-CLI-04 |
| HU-ENTR-05 | Aceptación de conexión | respuesta en `connection.service.js` ya incorporado | `TrainerRequestsPage.jsx` | HU-CLI-06 |
| HU-ENTR-06 | Reprogramación de turnos | ciclo coordinado por `turn.controller.js` ya incorporado | `TrainerDashboardPage.jsx` | HU-CLI-03; no existe endpoint dedicado: se cancela/rechaza y se solicita un nuevo turno |
| HU-ENTR-07 | Cancelación de turno | `services/turn.service.js`, `routes/turn.routes.js` | `TrainerTurnsPage.jsx` | HU-CLI-03 |
| HU-ENTR-08 | Rechazo de conexión | `routes/connection.routes.js` | rechazo en `TrainerRequestsPage.jsx` ya incorporado | HU-CLI-06, HU-ENTR-05 |
| HU-ADM-01 | Supervisión de pagos | consulta administrativa en `payment.service.js` ya incorporado | `AdminPaymentsPage.jsx` | HU-CLI-04 |
| HU-ADM-02 | Configuración de comisiones | `services/commission.service.js` | `AdminCommissionsPage.jsx` | HU-ADM-01, HU-CLI-05 |
| HU-ADM-03 | Gestión de usuarios | `controllers/user.controller.js`, `routes/user.routes.js`, `services/user.service.js` | `AdminUsersPage.jsx`, `AdminDashboardPage.jsx` | SEG-01 |
| HU-ADM-04 | Validación de certificaciones | aprobación en `certification.service.js` ya incorporado | `AdminCertificationsPage.jsx` | HU-USU-06, HU-ADM-03 |
| HU-ADM-05 | Moderación de calificaciones | moderación en `review.service.js` ya incorporado | `AdminModerationPage.jsx` | HU-CLI-05, HU-ADM-03 |
| HU-ADM-06 | Gestión de reportes | `controllers/report.controller.js`, `routes/report.routes.js`, `services/report.service.js` | `AdminReportsPage.jsx`, `TrainerReportsPage.jsx`, `TrainerCharts.jsx`, `trainerAnalytics.js` | HU-ADM-01 a HU-ADM-05 |
| DOC-01 | Gestión de configuración y versiones | — | — | `README.md`, `GESTION_CONFIGURACION.md`, `VERSIONES.md`, este mapeo |
| DEPLOY-01 | Vercel, Render y PostgreSQL | esquema y migración PostgreSQL | `vercel.json` | Todos los commits funcionales |
| TEST-01 | Validaciones del MVP | comandos de build, inicio y health check | build de producción | `PRUEBAS_MVP.md` |

## Observaciones de trazabilidad

- `backend/src/app.js` registra todas las rutas y se incorpora con la última
  ruta administrativa para evitar un archivo artificial por historia.
- `frontend/src/components/Routes.jsx` se incorpora en UI-01 como
  infraestructura compartida. `App.jsx` y `Navbar.jsx` se incorporan con las
  historias de disponibilidad que registran sus rutas y accesos.
- `AuthPages.jsx`, `MarketplacePage.jsx`, `MyTurnsPage.jsx`,
  `TrainerAvailabilityPage.jsx`, `TrainerRequestsPage.jsx` y varios servicios
  contienen más de una historia. Se incorporan en la primera historia que los
  necesita; las historias siguientes conservan trazabilidad mediante esta
  tabla y archivos complementarios reales.
- La disponibilidad se almacena localmente en el navegador. La reconstrucción
  no altera esa decisión de diseño.
- La reprogramación no posee una operación específica en la API actual. El
  comportamiento disponible consiste en cancelar o rechazar y crear un nuevo
  turno; se documenta sin modificar la lógica existente.
