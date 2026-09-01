# Validaciones del MVP

Fecha de validación: 2026-06-22.

| Validación | Comando | Resultado |
| --- | --- | --- |
| Dependencias backend | `npm install` | Correcto; 149 paquetes auditados, 0 vulnerabilidades |
| Build backend y Prisma | `npm run build` | Correcto; Prisma Client 6.19.3 generado |
| Inicio y health check backend | `node src/server.js` y `GET /api/health` | Correcto; `{"status":"ok","app":"FitConnection","database":"sqlite"}` |
| Dependencias frontend | `npm install` | Instalación correcta; npm informó 1 vulnerabilidad moderada y 1 alta en dependencias |
| Build frontend | `npm run build` | Correcto; Vite transformó 2327 módulos y generó `dist` |
| Exclusiones Git | `git ls-files` y `git check-ignore` | Correcto; `.env`, `node_modules`, `dist`, SQLite, logs y temporales están excluidos |
| Commits no vacíos | `git diff-tree --root --no-commit-id --name-only -r` | Correcto; ningún commit vacío |
| Mensajes oficiales | validación de asuntos con expresión regular | Correcto; todos respetan identificadores y formato |
| Integridad del sistema | comparación SHA-256 con la copia original | Correcto; código, diseño y esquemas no fueron modificados |
| Rama principal y remoto | `git branch --show-current` y `git remote -v` | Correcto; `main` y remoto oficial configurados |

No se modifican reglas de negocio para completar estas validaciones.

## Observaciones

- La API se inició con una copia local ignorada de la SQLite funcional y el
  health check respondió correctamente.
- La creación de una SQLite nueva mediante `prisma migrate` devolvió un error
  interno del motor de esquema en este entorno. La generación de Prisma Client,
  el build y el arranque con la base existente sí fueron correctos.
- No se ejecutó `npm audit fix --force` porque podría cambiar versiones o
  comportamiento fuera del alcance de esta reconstrucción.
- `dist`, `node_modules` y `backend/prisma/dev.db` permanecen únicamente como
  artefactos locales ignorados.
# Cobertura de reglas finales del MVP

Además de los casos E2E de este documento, `backend/test/mvp-rules.test.js`
verifica edad de menores y adultos, protección de menores, validación de nombre,
token de recuperación vigente/expirado/usado, comisión, intervalos superpuestos,
disponibilidad y liberación de horarios cancelados.

Los escenarios de integración manual obligatorios son:

1. Un menor no recibe entrenadores sin autorización en marketplace, detalle ni
   creación de solicitud.
2. Aprobar una certificación para menores habilita al entrenador; rechazarla o
   no tener otra vigente lo mantiene no autorizado.
3. Dos solicitudes concurrentes para el mismo entrenador y horario no pueden
   quedar activas simultáneamente.
4. Cancelar un turno permite volver a solicitar ese horario.
5. El entrenador visualiza bruto, porcentaje aplicado, comisión y neto.
6. Ninguna pantalla ni payload de pago ofrece descuentos.
