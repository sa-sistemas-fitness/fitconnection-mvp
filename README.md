# FitConnection

FitConnection es un MVP web para conectar clientes con entrenadores deportivos
verificados. Incluye marketplace de entrenadores, postulación y portal del
entrenador, solicitudes de conexión, chat, turnos, pagos simulados,
calificaciones, recuperación de contraseña por email y panel administrativo.
calificaciones, recuperación de contraseña por email, manual interactivo de usuario y panel administrativo.

## Objetivo del sistema

El sistema centraliza la búsqueda y contratación de entrenadores, permitiendo
que una persona se registre como cliente, se postule como entrenador si lo
desea y gestione turnos, pagos y comunicación dentro de una misma plataforma.

## Roles

- Cliente: usuario base de toda cuenta registrada. Puede buscar entrenadores,
  solicitar conexión, enviar mensajes, reservar turnos, pagar sesiones y
  calificar.
- Entrenador: rol adicional otorgado tras aprobación administrativa. Puede
  gestionar perfil profesional, certificaciones, solicitudes, disponibilidad,
  turnos, pagos y reportes.
- Administrador: rol creado por seed. Supervisa usuarios, certificaciones,
  comisiones, pagos, moderación y reportes.

## Flujo de usuario

1. Todo usuario se registra inicialmente como Cliente.
2. Desde el Portal del Entrenador puede postularse como Entrenador.
3. El Administrador valida documentación y certificaciones.
4. Si la postulación se aprueba, el usuario conserva rol Cliente y suma rol
   Entrenador.
5. Solo entrenadores aprobados y con cuenta activa aparecen en búsquedas.

## Funcionalidades principales

- Registro, login, roles y recuperación de contraseña.
- Fecha de nacimiento obligatoria y edad calculada por el backend.
- Protección automática de menores en búsquedas, perfiles y solicitudes.
- Marketplace de entrenadores con filtros.
- Perfil público de entrenador.
- Marketplace de entrenadores con filtros por especialidad, modalidad y tarifa.
- Perfil público de entrenador con reseñas y disponibilidad.
- Solicitudes de conexión cliente-entrenador.
- Chat asociado a solicitudes aceptadas.
- Gestión de turnos y disponibilidad.
- Pagos simulados, calificaciones y comisiones.
- Portal del entrenador.
- Panel administrador y reportes.
- Chat asociado a solicitudes aceptadas (vía REST).
- Gestión de turnos y disponibilidad semanal con persistencia en base de datos.
- Pagos simulados, calificaciones y comisiones calculadas en backend.
- Portal del entrenador y reportes de desempeño.
- Panel administrador y métricas globales del sistema.
- Bloqueo de cuenta y DNI desde administración.
- Preparación para despliegue frontend/backend.
- Manual interactivo de usuario por roles (`/manual`).
- Preparación para despliegue frontend/backend (Vercel y Render con PostgreSQL).

## Reglas críticas del MVP

- La edad nunca se recibe como una declaración del usuario: se deriva de
  `fechaNacimiento` mediante una función centralizada.
- Un cliente menor sólo puede encontrar, consultar y contactar entrenadores
  autorizados por Administración para trabajar con menores.
- La autorización para menores requiere una certificación marcada para ese fin
  y validada por Administración. Subir el archivo no concede autorización.
  y validada por Administración. Subir el archivo o enlace no concede autorización automática.
- La disponibilidad semanal del entrenador se persiste en la base de datos.
  Crear y aceptar un turno vuelve a comprobar disponibilidad y solapamientos en
  una transacción serializable.
- La comisión se calcula en backend y cada pago conserva el porcentaje aplicado,
  el importe bruto, la comisión y el neto del entrenador.
- El MVP no admite descuentos ni promociones.

## Stack tecnológico

- Frontend: React, Vite, TailwindCSS, React Router, Axios, Lucide React y
  Recharts.
- Backend: Node.js, Express, Prisma, JWT, bcrypt, CORS, dotenv y Nodemailer.
- Base local: SQLite.
- Base producción: PostgreSQL.
- Frontend: React 19, Vite 7, TailwindCSS 3.4, React Router 7, Axios, Lucide React y Recharts.
- Backend: Node.js 20+, Express 5, Prisma 6.19, JWT, bcrypt, CORS, dotenv y Nodemailer.
- Base de datos local: SQLite.
- Base de datos producción: PostgreSQL.
- Pruebas: Node Test Runner nativo (unitarias e integración) y Cypress 16 (E2E).
- Herramientas: npm, concurrently, Git.

## Estructura del proyecto

```text
fitconnection/
  backend/
  frontend/
  README.md
  GESTION_CONFIGURACION.md
  VERSIONES.md
  MAPEO_HISTORIAS_ARCHIVOS.md
  .gitignore
  package.json
  backend/                  # API REST Express + Prisma ORM
    prisma/                 # Schemas (SQLite y PostgreSQL), migraciones y seed
    src/                    # Controladores, rutas, servicios, middlewares y utilidades
    test/                   # Pruebas unitarias y de integración
  frontend/                 # Aplicación React + Vite + TailwindCSS
    src/
      components/           # Componentes UI compartidos y layouts
      context/              # Contexto de autenticación
      pages/                # Vistas de Cliente, Entrenador, Admin y Manual
  cypress/                  # Casos de prueba End-to-End (E2E)
    e2e/                    # Especificaciones de prueba automatizadas (cp01 a cp09)
    support/                # Comandos y configuración de Cypress
  cypress.config.js         # Configuración del motor Cypress
  README.md                 # Documentación principal del sistema
  GESTION_CONFIGURACION.md  # Plan de gestión de configuración y ramas
  VERSIONES.md              # Registro de versiones y líneas base
  MAPEO_HISTORIAS_ARCHIVOS.md # Matriz de trazabilidad historia-archivo
  PRUEBAS_MVP.md            # Registro oficial de validaciones del MVP
  .gitignore                # Exclusiones de control de versiones
  package.json              # Scripts y dependencias de orquestación raíz
  package-lock.json         # Bloqueo de dependencias raíz
```

## Requisitos previos

- Node.js 20.19 o superior.
- npm 10 o superior.
- Git.

## Instalación desde GitHub

```bash
git clone https://github.com/sa-sistemas-fitness/fitconnection-mvp.git
cd fitconnection-mvp
npm install
npm run install:all
```

`npm install` instala las dependencias del package raíz, incluido
`concurrently`. `npm run install:all` instala dependencias de backend y
frontend.
`npm install` instala las dependencias del package raíz (incluidos `concurrently` y `cypress`).
`npm run install:all` instala dependencias de `backend` y `frontend`.

## Configuración de `.env`

Cada integrante debe copiar las plantillas:

En Windows (PowerShell / CMD):

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

En Linux/macOS:
En Linux / macOS:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No se deben versionar archivos `.env` reales. `.gitignore` excluye
`backend/.env`, `frontend/.env` y cualquier `.env`.
`backend/.env`, `frontend/.env` y cualquier archivo `.env`.

### Backend local
### Backend local (`backend/.env`)

`backend/.env.example` documenta:
Variables configurables:

```env
DATABASE_URL="file:./prisma/dev.db"
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambiar_en_entorno_real"
DNI_HASH_SECRET="cambiar_en_entorno_real"
PORT=4000
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"

NODE_ENV=development
JWT_EXPIRES_IN=8h
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="FitConnection <correo@gmail.com>"
```

Nota: Prisma resuelve rutas SQLite respecto del schema usado. En este repositorio
el schema local es `backend/prisma/schema.prisma`. Si tu entorno crea una ruta
anidada no deseada, usá `DATABASE_URL="file:./dev.db"` para apuntar a
`backend/prisma/dev.db`, que es la ubicación local validada.
> [!NOTE]
> Prisma resuelve rutas relativas SQLite respecto a la ubicación del archivo `schema.prisma` (`backend/prisma/`). Por tanto, usar `DATABASE_URL="file:./dev.db"` ubica correctamente la base de datos en `backend/prisma/dev.db`. Si se utilizara `file:./prisma/dev.db`, Prisma crearía una ruta anidada redundante (`backend/prisma/prisma/dev.db`).

### Frontend local
### Frontend local (`frontend/.env`)

`frontend/.env.example`:

```env
VITE_API_URL="http://localhost:4000"
```

## Inicio rápido desde la raíz

```bash
npm install
npm run install:all
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

`npm run dev` inicia simultáneamente:

- Backend: <http://localhost:4000>
- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:4000>
- Frontend Web: <http://localhost:5173>

Health check:
Health check de la API:

```text
GET http://localhost:4000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "app": "FitConnection",
  "database": "sqlite"
}
```

## Comandos individuales

Desde la raíz:
### Desde la raíz del repositorio

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
# Desarrollo
npm run dev              # Inicia backend y frontend en paralelo
npm run dev:backend      # Inicia únicamente el backend con nodemon
npm run dev:frontend     # Inicia únicamente el frontend con Vite

# Base de datos local (SQLite)
npm run prisma:generate  # Genera el cliente de Prisma para SQLite
npm run prisma:push      # Sincroniza esquema de SQLite sin crear migraciones
npm run prisma:seed      # Pobla la base con catálogos y usuarios de prueba

# Compilación
npm run build            # Compila backend (Prisma) y frontend (Vite)

# Pruebas
npm test                 # Ejecuta las pruebas unitarias del backend
npm run test:e2e         # Ejecuta las pruebas E2E con Cypress (headless)
npm run cypress:open     # Abre la interfaz gráfica interactiva de Cypress
npm run cypress:run      # Ejecuta Cypress headless en Chrome
```

Backend:
### Backend (`cd backend`)

```bash
cd backend
npm run dev
npm start
npm run build
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run prisma:studio
npm run dev                      # Inicia el backend con recarga automática
npm start                        # Inicia el backend en modo directo (producción)
npm test                         # Ejecuta pruebas con el runner nativo de Node
npm run build                    # Genera cliente Prisma para SQLite
npm run prisma:generate          # Genera cliente Prisma para SQLite
npm run prisma:push              # Sincroniza esquema SQLite
npm run prisma:seed              # Ejecuta el script seed.js
npm run prisma:studio            # Abre el visualizador web Prisma Studio
npm run prisma:generate:postgres # Genera cliente Prisma para PostgreSQL (prod)
npm run prisma:migrate:postgres  # Aplica migraciones en PostgreSQL (prod)
```

Frontend:
### Frontend (`cd frontend`)

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run dev      # Inicia servidor de desarrollo Vite
npm run build    # Compila aplicación para producción en /dist
npm run preview  # Previsualiza la compilación de producción localmente
```

## Configuración Prisma local

Desarrollo local usa SQLite y el schema predeterminado:

```text
backend/prisma/schema.prisma
```

Debe contener:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Scripts locales:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

No se usan en desarrollo:

- `prisma:migrate:sqlite`
- `prisma:seed:sqlite`
- `prisma.config.js`
- `prisma.sqlite.config.js`

## Datos seed y usuarios de prueba

El seed reinicia datos de demostración y crea usuarios base:
El comando `npm run prisma:seed` reinicia los datos de demostración y crea usuarios base listos para operar:

| Rol | Email | Contraseña |
| Rol | Email | Contraseña | Perfil y Particularidades |
| --- | --- | --- | --- |
| Cliente | `cliente@fitconnection.com` | `cliente123` | Cliente estándar con perfil activo |
| Entrenador | `entrenador@fitconnection.com` | `entrenador123` | Entrenador aprobado, con certificación habilitante para menores y turnos |
| Administrador | `admin@fitconnection.com` | `admin123` | Acceso a paneles de supervisión, validación, moderación y métricas |

Adicionalmente, el seed crea entrenadores de muestra en tenis, baloncesto, yoga, natación y atletismo para poblar el marketplace, así como solicitudes, turnos reservados y un pago simulado aprobado con reseña de ejemplo.

## Pruebas automatizadas

El sistema cuenta con una estrategia de pruebas en dos niveles:

### 1. Pruebas Unitarias y de Reglas (Backend)

Ejecutadas con el runner nativo de Node.js (`node --test`):

```bash
npm test
# O alternativamente:
cd backend
npm test
```

Verifican:
- Detección y derivación de edad de menores y adultos.
- Restricción estricta de entrenadores autorizados para menores.
- Validación de caracteres y longitud en nombres y apellidos.
- Generación segura de tokens de recuperación, expiración y uso único.
- Cálculo exacto de importes brutos, comisiones y neto del entrenador.
- Detección de turnos duplicados o parcialmente superpuestos.
- Persistencia de horarios semanales y liberación de bloques cancelados.

### 2. Pruebas de Integración (Backend con Base de Datos)

El archivo `backend/test/mvp-integration.test.js` ejecuta un ciclo de vida completo (registro de menor, consulta de marketplace filtrado, solicitud de conexión, reserva de turno, detección de colisión y cancelación).

Para activarlo, definir la variable `MVP_INTEGRATION=1`:

En Linux / macOS:

```bash
cd backend
MVP_INTEGRATION=1 npm test
```

En Windows (PowerShell):

```powershell
cd backend
$env:MVP_INTEGRATION="1"; npm test; Remove-Item Env:\MVP_INTEGRATION
```

### 3. Pruebas End-to-End (Cypress)

Las pruebas E2E verifican la interacción real en el navegador conectando frontend y backend:

1. Levantar la base de datos con datos de prueba:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```
2. Iniciar la aplicación:
   ```bash
   npm run dev
   ```
3. Ejecutar las pruebas desde otra terminal en la raíz:
   ```bash
   # Modo interactivo (interfaz gráfica para depuración)
   npm run cypress:open

   # Modo headless automatizado
   npm run test:e2e
   # O en Chrome específicamente:
   npm run cypress:run
   ```

Casos de prueba cubiertos en `cypress/e2e/`:

| Caso | Archivo | Descripción del Escenario |
| --- | --- | --- |
| Cliente | `cliente@fitconnection.com` | `cliente123` |
| Entrenador | `entrenador@fitconnection.com` | `entrenador123` |
| Administrador | `admin@fitconnection.com` | `admin123` |
| CP01 | `cp01-registro-exitoso.cy.js` | Registro exitoso de usuario con validación de edad y redirección |
| CP02 | `cp02-registro-campos-vacios.cy.js` | Rechazo de envío y retroalimentación de campos requeridos |
| CP03 | `cp03-registro-menor-edad.cy.js` | Restricción automática de marketplace para clientes menores de 18 años |
| CP04 | `cp04-pago-exitoso.cy.js` | Flujo de pago simulado aprobado y confirmación de sesión |
| CP05 | `cp05-pago-rechazado.cy.js` | Flujo de pago simulado rechazado y permanencia en estado pendiente |
| CP06 | `cp06-acceso-sin-auth.cy.js` | Protección de rutas autenticadas y redirección al inicio de sesión |
| CP07 | `cp07-admin-aprobar-certificacion.cy.js` | Aprobación administrativa de certificación y habilitación para menores |
| CP08 | `cp08-admin-rechazar-certificacion.cy.js` | Rechazo administrativo de certificación con justificación |
| CP09 | `cp09-cliente-accede-admin.cy.js` | Denegación de acceso a paneles de administración para rol Cliente |

El entrenador seed está aprobado y cuenta con perfil/certificación de ejemplo.
También se cargan entrenadores adicionales para visualizar marketplace y
reportes.
Para consultar el registro formal de validación y auditoría, ver [PRUEBAS_MVP.md](PRUEBAS_MVP.md).

Después de actualizar una instalación existente, aplicar las migraciones antes
de iniciar la API. Las filas históricas sin fecha de nacimiento reciben una
fecha técnica de migración y deben ser revisadas administrativamente.
## Catálogo de endpoints de la API REST

Todas las respuestas de error siguen el formato estándar `{ "message": "Descripción del error" }`.

| Módulo | Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- | --- |
| **Salud** | `GET` | `/api/health` | Público | Comprueba estado del servidor y proveedor de base de datos |
| **Auth** | `POST` | `/api/auth/register` | Público | Registro de usuario (deriva edad y hashea DNI) |
| **Auth** | `POST` | `/api/auth/login` | Público | Autenticación y entrega de token JWT |
| **Auth** | `POST` | `/api/auth/forgot-password` | Público | Solicita restablecimiento de contraseña |
| **Auth** | `POST` | `/api/auth/reset-password` | Público | Restablece contraseña con token de un solo uso |
| **Auth** | `GET` | `/api/auth/me` | Autenticado | Devuelve los datos y roles del usuario activo |
| **Auth** | `POST` | `/api/auth/change-password` | Autenticado | Cambio de contraseña requiriendo clave actual |
| **Usuarios** | `GET` | `/api/users` | Administrador | Listado y supervisión de usuarios |
| **Usuarios** | `GET` | `/api/users/:id` | Administrador | Detalle de un usuario específico |
| **Usuarios** | `PATCH` | `/api/users/:id/status` | Administrador | Modifica estado de cuenta (Activo, Suspendido, Bloqueado) |
| **Usuarios** | `POST` | `/api/users/:id/block` | Administrador | Bloquea definitivamente cuenta e identidad (DNI hash) |
| **Usuarios** | `PATCH` | `/api/users/profile` | Autenticado | Modifica nombre y apellido del perfil personal |
| **Entrenadores** | `GET` | `/api/trainers` | Cliente | Marketplace de entrenadores (filtrado por menores si aplica) |
| **Entrenadores** | `GET` | `/api/trainers/:id` | Cliente | Perfil profesional, certificaciones y reseñas públicas |
| **Entrenadores** | `POST` | `/api/trainers/apply` | Cliente | Postulación para adquirir el rol Entrenador |
| **Entrenadores** | `GET` | `/api/trainers/me` | Entrenador | Perfil profesional propio |
| **Entrenadores** | `PUT` | `/api/trainers/me` | Entrenador | Actualiza descripción, tarifa, modalidad y especialidades |
| **Entrenadores** | `GET` | `/api/trainers/me/availability` | Entrenador | Disponibilidad semanal propia y turnos programados |
| **Entrenadores** | `POST` | `/api/trainers/me/availability` | Entrenador | Agrega bloque semanal disponible |
| **Entrenadores** | `DELETE` | `/api/trainers/me/availability/:id` | Entrenador | Elimina bloque de disponibilidad semanal |
| **Entrenadores** | `GET` | `/api/trainers/:id/availability` | Cliente | Disponibilidad visible de un entrenador para reservar |
| **Entrenadores** | `PATCH` | `/api/trainers/:id/status` | Administrador | Aprueba o rechaza postulación de entrenador |
| **Especialidades** | `GET` | `/api/specialties` | Autenticado | Catálogo de especialidades deportivas |
| **Certificaciones** | `POST` | `/api/certifications` | Entrenador | Presenta certificación y declara si habilita menores |
| **Certificaciones** | `GET` | `/api/certifications/me` | Entrenador | Consulta estado de certificaciones propias |
| **Certificaciones** | `GET` | `/api/certifications` | Administrador | Listado de certificaciones pendientes de validación |
| **Certificaciones** | `PATCH` | `/api/certifications/:id/status` | Administrador | Aprueba (con opción de menores) o rechaza certificación |
| **Conexiones** | `POST` | `/api/connection-requests` | Cliente | Envía solicitud de conexión a un entrenador |
| **Conexiones** | `GET` | `/api/connection-requests/sent` | Cliente | Consulta solicitudes de conexión enviadas |
| **Conexiones** | `GET` | `/api/connection-requests/received` | Entrenador | Consulta solicitudes de conexión recibidas |
| **Conexiones** | `PATCH` | `/api/connection-requests/:id/respond` | Entrenador | Acepta o rechaza solicitud de conexión |
| **Conexiones** | `DELETE` | `/api/connection-requests/:id` | Autenticado | Cancela solicitud de conexión |
| **Chat** | `GET` | `/api/chats` | Autenticado | Lista conversaciones habilitadas (solicitud aceptada) |
| **Chat** | `GET` | `/api/chats/:id/messages` | Autenticado | Historial de mensajes del chat |
| **Chat** | `POST` | `/api/chats/:id/messages` | Autenticado | Envía nuevo mensaje en la conversación |
| **Turnos** | `POST` | `/api/turns` | Cliente | Solicita turno (valida disponibilidad en transacción serializable) |
| **Turnos** | `GET` | `/api/turns/my` | Cliente | Turnos del cliente (solicitados, reservados, finalizados) |
| **Turnos** | `GET` | `/api/turns/received` | Entrenador | Agenda de turnos recibidos |
| **Turnos** | `PATCH` | `/api/turns/:id/respond` | Entrenador | Acepta o rechaza solicitud de turno |
| **Turnos** | `PATCH` | `/api/turns/:id/cancel` | Autenticado | Cancela turno y libera el bloque horario |
| **Pagos** | `POST` | `/api/payments` | Cliente | Simula pago de turno reservado y calcula comisión |
| **Pagos** | `GET` | `/api/payments/my` | Cliente | Historial de pagos realizados |
| **Pagos** | `GET` | `/api/payments/received` | Entrenador | Liquidaciones recibidas con desglose de comisión y neto |
| **Pagos** | `GET` | `/api/payments` | Administrador | Auditoría de pagos y comisiones totales |
| **Calificaciones** | `POST` | `/api/reviews` | Cliente | Califica al entrenador tras un turno pagado |
| **Calificaciones** | `GET` | `/api/reviews/trainer/:id` | Cliente | Calificaciones públicas visibles y aprobadas |
| **Calificaciones** | `GET` | `/api/reviews` | Administrador | Calificaciones para moderación |
| **Calificaciones** | `PATCH` | `/api/reviews/:id/moderate` | Administrador | Modera (hace visible u oculta) una calificación |
| **Reportes** | `GET` | `/api/reports/overview` | Administrador | Métricas globales (usuarios, turnos, volumen, comisiones) |
| **Reportes** | `GET` | `/api/reports/connections` | Administrador | Estadísticas de solicitudes de conexión |
| **Reportes** | `GET` | `/api/reports/turns` | Administrador | Estadísticas de estados de turnos |
| **Reportes** | `GET` | `/api/reports/payments` | Administrador | Estadísticas financieras y comisiones |
| **Reportes** | `GET` | `/api/reports/trainer/summary` | Entrenador | Resumen de rendimiento individual del entrenador |
| **Reportes** | `GET` | `/api/reports/trainer/evolution` | Entrenador | Evolución cronológica de turnos y facturación |

## Manual interactivo de usuario

La aplicación integra una guía de usuario accesible directamente desde la interfaz web:

- Ruta directa: `/manual`
- Acceso: Botón de ayuda en la barra de navegación superior.
- Secciones especializadas según el rol activo:
  - **Cliente**: Primeros pasos, búsqueda en marketplace, solicitudes de conexión, turnos, pagos simulados y calificaciones.
  - **Entrenador**: Postulación, configuración de perfil profesional, carga de certificaciones, disponibilidad semanal y liquidaciones.
  - **Administrador**: Gestión de usuarios, validación de credenciales, moderación de opiniones y lectura de reportes.
- Incluye buscador integrado por palabras clave y recomendaciones de seguridad.

## Recuperación de contraseña y SMTP Gmail

Endpoint:

```text
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Comportamiento:

- Si SMTP está configurado, Gmail envía el correo real.
- Gmail requiere verificación en dos pasos y contraseña de aplicación.
- Si SMTP no está configurado, el backend imprime en consola el enlace de
  recuperación.
- El token nunca se devuelve en la respuesta HTTP.
- La respuesta no revela si el email existe.
- El token se almacena hasheado, vence en una hora, se consume de forma atómica
  y no puede reutilizarse.
- No guardar credenciales SMTP reales en GitHub.

Variables Gmail recomendadas:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="correo@gmail.com"
SMTP_PASS="contraseña_de_aplicación"
SMTP_FROM="FitConnection <correo@gmail.com>"
FRONTEND_URL="http://localhost:5173"
```

Al iniciar el backend se ejecuta `transporter.verify()` y se informa por consola
si SMTP está configurado correctamente, si no está configurado o si hay error de
autenticación.

## Pruebas
## Decisiones técnicas de arquitectura

Las reglas centrales del backend se verifican con el runner nativo de Node:
- **Mensajería / Chat**: Implementado mediante peticiones HTTP REST a demanda con botón de actualización manual y scroll automático al último mensaje, prescindiendo de dependencias complejas de WebSockets para mantener la simplicidad y robustez del MVP.
- **Adjuntos de Certificaciones**: Los documentos de certificación se gestionan como cadenas o URLs de referencia en base de datos sin almacenamiento multipart en disco ni dependencias de buckets S3, manteniendo el foco en el flujo de validación administrativa.
- **Doble Seguridad de DNI**: El DNI se almacena hasheado con clave secreta (`dniHash`) para validaciones de unicidad y bloqueos, junto con una máscara visual (`dniMascara`, ej. `**.***.123`) para proteger la privacidad del usuario.

```bash
cd backend
npm test
```

Las pruebas E2E existentes se ejecutan desde la raíz con `npm run test:e2e`
después de levantar frontend, backend y una base inicializada.

## Fuera del MVP / Desarrollo futuro

- Desarrollo futuro — Parametrización de máximos y mínimos.
- Subsistema Fintech avanzado — Desarrollo futuro.
- Descuentos/promociones.
- Billetera, transferencias, conciliación y liquidaciones financieras avanzadas.

Estas capacidades no tienen pantallas ni configuraciones parciales en el MVP.

## Desarrollo local con SQLite

- SQLite es la base local predeterminada.
- El archivo de base local no se versiona.
- `backend/prisma/dev.db` está excluido por `.gitignore`.
- `npm run prisma:push` crea/sincroniza tablas locales.
- `npm run prisma:seed` carga datos de prueba.

## Producción con PostgreSQL

PostgreSQL se mantiene separado y explícito:

```text
backend/prisma/schema.postgresql.prisma
backend/prisma/migrations-postgresql/
```

Scripts de producción:

```bash
cd backend
npm run prisma:generate:postgres
npm run prisma:migrate:postgres
npm start
```

El backend local (`npm run dev`) no usa PostgreSQL automáticamente.

## Despliegue

### Frontend en Vercel

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variable: `VITE_API_URL=https://URL_PUBLICA_DEL_BACKEND`

### Backend en Render

- Root Directory: `backend`
- Build Command: `npm install && npm run prisma:generate:postgres`
- Start Command: `npm run prisma:migrate:postgres && npm start`
- Health Check Path: `/api/health`
- Variables: `DATABASE_URL`, `JWT_SECRET`, `DNI_HASH_SECRET`, `FRONTEND_URL`,
  `NODE_ENV=production` y SMTP si corresponde.
  `CORS_ORIGIN`, `NODE_ENV=production` y SMTP si corresponde.

### PostgreSQL externo

Usar un servicio PostgreSQL administrado. `DATABASE_URL` debe tener formato:

```env
DATABASE_URL="postgresql://USUARIO:CLAVE@HOST:5432/BASE?schema=public"
```

## Gestión de configuración

La documentación de gestión está en:

- [GESTION_CONFIGURACION.md](GESTION_CONFIGURACION.md)
- [VERSIONES.md](VERSIONES.md)
- [MAPEO_HISTORIAS_ARCHIVOS.md](MAPEO_HISTORIAS_ARCHIVOS.md)
- [PRUEBAS_MVP.md](PRUEBAS_MVP.md)

Rama principal: `main`.

## Convención de ramas y commits

Ramas sugeridas:
Para nuevas historias de usuario se recomienda la convención estándar especificada en [GESTION_CONFIGURACION.md](GESTION_CONFIGURACION.md):

```text
feature/HU-01-auth
feature/HU-04-entrenadores
feature/HU-06-conexiones
feature/HU-07-chat
feature/HU-08-turnos
feature/HU-09-pagos-calificaciones
feature/HU-10-portal-entrenador
feature/ADMIN-01-admin
feature/HU-USU-01-registro
feature/HU-USU-02-login
feature/HU-CLI-01-busqueda
feature/HU-CLI-03-turnos
feature/HU-ENTR-01-disponibilidad
feature/HU-ADM-03-usuarios
docs/gestion-configuracion
```

*(En el repositorio también existen ramas de soporte consolidadas como `feature/HU-01-auth`, `feature/HU-04-entrenadores`, `feature/HU-08-turnos`, etc.)*.

Formato de commit:

```text
IDENTIFICADOR: descripción en presente
```

Ejemplo:

```text
CFG-03: simplifica arranque local y actualiza documentación del proyecto
```

## Solución de problemas frecuentes

### Falta `DATABASE_URL`

Copiá `backend/.env.example` a `backend/.env` y verificá la variable
`DATABASE_URL`.
`DATABASE_URL="file:./dev.db"`.

### Bloqueo de archivo en Windows (`EPERM: operation not permitted` en `query_engine-windows.dll.node`)

Ocurre al ejecutar `npm run build` o `npm run prisma:generate` mientras el backend (`npm run dev` o `nodemon`) está en ejecución, ya que el sistema operativo Windows bloquea el archivo binario del motor de Prisma mientras está cargado en memoria.
**Solución**: Detén el servidor en ejecución (`Ctrl + C` en la consola) antes de compilar o regenerar el cliente Prisma.

### Prisma intenta usar PostgreSQL en local

Usá scripts locales:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

No uses `prisma:generate:postgres` ni `prisma:migrate:postgres` salvo en
producción.

### No llega el correo de recuperación

- Verificá `SMTP_USER` y `SMTP_PASS`.
- En Gmail usá contraseña de aplicación.
- En Gmail usá contraseña de aplicación de 16 caracteres.
- Revisá logs de `[SMTP]` al iniciar backend.
- Si SMTP está vacío, buscá el enlace en consola.
- Si SMTP está vacío, buscá el enlace impreso en consola.

### El frontend no conecta al backend

Verificá `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000"
```

Asegúrate de que el backend esté activo en el puerto 4000 y coincida con `PORT` en `backend/.env`.

### Navbar o menú de usuario

El menú de usuario se renderiza por encima de la interfaz y debe mostrar siempre
`Mi perfil`, `Cambiar contraseña` y `Cerrar sesión`.

