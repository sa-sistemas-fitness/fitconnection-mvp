# Validaciones y Plan de Pruebas del MVP

Registro formal de validaciones, pruebas automatizadas y criterios de aceptación del MVP de FitConnection.

---

## 1. Validaciones de Infraestructura y Línea Base

Fecha de validación inicial: 2026-06-22.

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

### Observaciones de infraestructura

- La API se inició con una copia local ignorada de la SQLite funcional y el health check respondió correctamente.
- La creación de una SQLite nueva mediante `prisma migrate` devolvió un error interno del motor de esquema en este entorno. La generación de Prisma Client, el build y el arranque con la base existente sí fueron correctos.
- No se ejecutó `npm audit fix --force` porque podría cambiar versiones o comportamiento fuera del alcance de esta reconstrucción.
- `dist`, `node_modules` y `backend/prisma/dev.db` permanecen únicamente como artefactos locales ignorados.

---

## 2. Pruebas Automatizadas de Backend (Lógica de Negocio y Reglas)

Ejecutadas con el runner nativo de Node.js (`node:test` y `node:assert/strict`).

### Comandos de ejecución

```bash
# Desde la raíz del repositorio:
npm test

# O directamente en el directorio backend:
npm test --prefix backend
# o:
cd backend && npm test
```

### 2.1 Pruebas Unitarias de Reglas de Negocio (`backend/test/mvp-rules.test.js`)

Cubre 16 pruebas unitarias puras organizadas por módulo funcional:

| Módulo / Dominio | Test implementado | Objetivo y Aserción |
| --- | --- | --- |
| **Protección de Menores** | `usuario menor de 18 años` | Calcula edad relativa a fecha de referencia y confirma `isMinor === true`. |
| **Protección de Menores** | `usuario mayor de 18 años` | Calcula edad en mayores y confirma `isMinor === false`. |
| **Protección de Menores** | `menor encuentra entrenador autorizado` | Verifica que entrenador con `trabajaConMenores: true` es visible para menores. |
| **Protección de Menores** | `menor no encuentra entrenador no autorizado` | Verifica que entrenador con `trabajaConMenores: false` queda oculto para menores. |
| **Protección de Menores** | `adulto puede encontrar entrenador sin autorización para menores` | Confirma que clientes mayores de 18 años ven toda la oferta de entrenadores. |
| **Validación de Datos** | `cambio de nombre y apellido valida caracteres y longitud` | Sanitiza espacios en blanco, admite tildes y caracteres válidos, y rechaza alfanuméricos incorrectos. |
| **Seguridad y Auth** | `recuperación genera token seguro y expiración` | Genera token criptográfico de 64 caracteres, hash SHA-256 y verifica vigencia dentro del límite temporal. |
| **Seguridad y Auth** | `token expirado no es utilizable` | Inhabilita el restablecimiento de contraseña ante tokens con fecha de expiración vencida. |
| **Seguridad y Auth** | `token reutilizado no es utilizable` | Inhabilita el token una vez que su bandera `usado` es `true`. |
| **Modelo Financiero** | `cálculo de comisión devuelve bruto, comisión y neto` | Comprueba exactitud matemática: bruto menos porcentaje de comisión igual a neto del entrenador. |
| **Modelo Financiero** | `desglose de comisión contiene los campos visibles al entrenador` | Valida el contrato de respuesta: `importeBruto`, `porcentajeComision`, `comision`, `importeNetoEntrenador`. |
| **Turnos y Horarios** | `doble reserva exacta es detectada` | Detecta conflicto de solapamiento en intervalos de horario exactamente idénticos. |
| **Turnos y Horarios** | `turnos parcialmente superpuestos son detectados` | Identifica superposición parcial (ej. 18:00-19:00 vs 18:30-19:30) y admite turnos consecutivos sin colisión. |
| **Turnos y Horarios** | `disponibilidad visible conserva rango y día UTC` | Valida consistencia de formato de horas y cálculo homogéneo de fechas/días en UTC. |
| **Turnos y Horarios** | `horario ocupado no es seleccionable` | Comprueba que estados `"Solicitado"` y `"Reservado"` bloquean la franja horaria. |
| **Turnos y Horarios** | `cancelación libera el horario` | Confirma que el estado `"Cancelado"` libera inmediatamente el bloque para nuevas solicitudes. |

### 2.2 Prueba de Integración con Base de Datos (`backend/test/mvp-integration.test.js`)

Evalúa el ciclo de vida completo interactuando con la base de datos y los servicios:

- **Requisito**: Base de datos SQLite activa con esquema y datos base.
- **Activación**: Variable de entorno `MVP_INTEGRATION=1`.

```bash
# En Windows (PowerShell):
$env:MVP_INTEGRATION="1"; npm test --prefix backend; Remove-Item Env:\MVP_INTEGRATION

# En Linux / macOS / Bash:
MVP_INTEGRATION=1 npm test --prefix backend
```

- **Flujo verificado**:
  1. Registro de cliente menor de edad mediante servicio de autenticación.
  2. Consulta al marketplace verificando que el 100% de entrenadores retornados tienen habilitación para menores.
  3. Creación y aceptación de solicitud de conexión.
  4. Reserva de turno en un bloque horario válido.
  5. Intento de doble reserva en el mismo horario verificando rechazo con código **HTTP 409 (Conflict)**.
  6. Cancelación formal del turno liberando el horario.
  7. Creación exitosa de un nuevo turno sobre el bloque liberado.

---

## 3. Pruebas End-to-End E2E (Cypress)

Ejecutadas con Cypress contra la aplicación completa (Frontend React + API REST Backend).

### Requisitos previos para ejecutar E2E

1. Inicializar y poblar la base de datos:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```
2. Levantar la aplicación en desarrollo (Backend en puerto 4000 y Frontend en 5173/5174):
   ```bash
   npm run dev
   ```
3. Ejecutar Cypress desde otra terminal:
   ```bash
   # Modo interactivo con interfaz visual:
   npm run cypress:open

   # Modo headless automatizado:
   npm run test:e2e
   # O en Chrome específicamente:
   npm run cypress:run
   ```

### 3.1 Matriz de Casos de Prueba E2E

| Caso | Archivo | Historia de Usuario | Escenario evaluado | Resultado esperado |
| --- | --- | --- | --- | --- |
| **CP-01** | `cypress/e2e/cp01-registro-exitoso.cy.js` | `HU-USU-01` | Registro con datos válidos y únicos generados por timestamp. | API responde 201 Created y redirige al panel del cliente (`/panel`). |
| **CP-02** | `cypress/e2e/cp02-registro-campos-vacios.cy.js` | `HU-USU-01` | Envío de formulario vacío e intento de registro con email duplicado. | API responde 400, bloquea redirección y muestra alertas visuales de validación. |
| **CP-03** | `cypress/e2e/cp03-registro-menor-edad.cy.js` | `HU-USU-01` | Registro de usuario menor de edad (16 años calculados dinámicamente). | Backend deriva edad 16, asigna `isMinor: true` y restringe el marketplace. |
| **CP-04** | `cypress/e2e/cp04-pago-exitoso.cy.js` | `HU-CLI-04` | Pago simulado exitoso de turno reservado desde la UI. | Registro de pago (201), estado Aprobado y mensaje de confirmación visible. |
| **CP-05** | `cypress/e2e/cp05-pago-rechazado.cy.js` | `HU-CLI-04` | Pago simulado rechazado (fondos insuficientes o error de pasarela). | Estado Rechazado, alerta en UI y turno permanece sin confirmar. |
| **CP-06** | `cypress/e2e/cp06-acceso-sin-auth.cy.js` | `HU-CLI-04` / Seguridad | Intento de acceso directo a rutas protegidas (`/turnos`, `/panel`) sin token JWT. | `ProtectedRoute` redirige a `/login` preservando la ruta de destino. |
| **CP-07** | `cypress/e2e/cp07-admin-aprobar-certificacion.cy.js` | `HU-ADM-04` | Aprobación administrativa de certificación presentada por entrenador. | Certificación pasa a estado Validada y sale del listado de pendientes. |
| **CP-08** | `cypress/e2e/cp08-admin-rechazar-certificacion.cy.js` | `HU-ADM-04` | Rechazo administrativo de certificación con justificación obligatoria. | Modal exige motivo, estado pasa a Rechazada y se notifica en UI. |
| **CP-09** | `cypress/e2e/cp09-cliente-accede-admin.cy.js` | `HU-ADM-04` / RBAC | Cliente con sesión activa intenta acceder a rutas `/admin/*`. | `RoleRoute` redirige a `/panel` y llamadas a endpoints admin retornan 403 Forbidden. |

---

## 4. Cobertura de Reglas Finales y Validación Manual del MVP

Escenarios de integración y aceptación obligatorios verificados antes de cada entrega:

1. **Protección estricta de menores**:
   Un menor de 18 años no recibe entrenadores sin autorización expresa (`trabajaConMenores: false`) en el marketplace, en la vista de detalle ni en la creación de solicitudes de conexión.
2. **Ciclo de habilitación por certificaciones**:
   Aprobar una certificación para menores habilita al entrenador; rechazarla o no contar con una vigente lo mantiene no autorizado para trabajar con menores.
3. **Prevención de colisiones concurrentes**:
   Dos solicitudes simultáneas para el mismo entrenador y horario no pueden quedar activas a la vez (detección de solapamiento con código 409).
4. **Liberación por cancelación**:
   Cancelar un turno libera inmediatamente el horario, permitiendo que otro cliente (o el mismo) reserve dicho slot.
5. **Transparencia en liquidaciones**:
   El entrenador visualiza con claridad: importe bruto, porcentaje de comisión aplicado, monto de comisión retenido e importe neto a cobrar.
6. **Integridad de precios y pagos**:
   Ninguna pantalla ni payload de pago admite o calcula descuentos no autorizados por las reglas del MVP.
