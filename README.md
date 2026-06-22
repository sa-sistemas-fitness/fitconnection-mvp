# FitConnection

Plataforma deportiva local para conectar clientes con entrenadores
especializados.

El backend incluye la API REST de autenticación, usuarios, postulaciones,
certificaciones, conexiones, chat, turnos, pagos simulados, calificaciones y
reportes. El frontend incluye landing, marketplace, perfiles, paneles por rol,
portal del entrenador y chat con una interfaz SaaS fitness responsive.

## Reglas implementadas

- Toda persona registrada recibe el rol `Cliente` y un perfil Cliente.
- El administrador se crea únicamente mediante el seed.
- Un usuario puede ser Cliente y Entrenador a la vez.
- El rol Entrenador se agrega solo después de la aprobación administrativa.
- Solo entrenadores aprobados y con cuenta activa aparecen en búsquedas.
- Una solicitud aceptada crea el chat y permite solicitar turnos.
- Un turno aceptado pasa de `Solicitado` a `Reservado`.
- Solo los turnos reservados pueden pagarse.
- Los pagos son simulados.
- Solo un pago aprobado permite una calificación.
- Las calificaciones recalculan promedio y comisión.
- No existen membresías.
- No existe la entidad `Sesion`; el entrenamiento se representa con `Turno`.

## Stack y requisitos

- Frontend: React, Vite, TailwindCSS, React Router, Axios y Lucide React.
- Backend: Node.js, Express, Prisma, PostgreSQL en producción, SQLite en
  desarrollo local, JWT, bcrypt, CORS, dotenv y Nodemailer.
- Node.js 20.19 o superior y npm.

No se necesita Docker. PostgreSQL se utiliza únicamente en producción.

## Ejecutar el proyecto

Backend:

```bash
cd fitconnection/backend
npm install
npm run prisma:migrate:sqlite
npm run prisma:seed:sqlite
npm run dev
```

La API queda en <http://localhost:4000>.

Frontend, en otra terminal:

```bash
cd fitconnection/frontend
npm install
npm run dev
```

La aplicación queda en <http://localhost:5173>.

> Si abrís <http://localhost:4000> directamente, es normal recibir
> `{"message":"Recurso no encontrado"}`. La API utiliza rutas `/api`. Para
> comprobarla, abrí <http://localhost:4000/api/health>.

El health check devuelve:

```json
{
  "status": "ok",
  "app": "FitConnection",
  "database": "sqlite"
}
```

`npm run dev` regenera automáticamente Prisma Client con
`prisma/schema.sqlite.prisma`, conservando la base local existente.

## Credenciales del seed

| Cuenta | Email | Contraseña | Roles |
| --- | --- | --- | --- |
| Administrador | `admin@fitconnection.com` | `admin123` | Administrador |
| Cliente | `cliente@fitconnection.com` | `cliente123` | Cliente |
| Entrenador | `entrenador@fitconnection.com` | `entrenador123` | Cliente, Entrenador |

El entrenador del seed está aprobado, tiene especialidad Fuerza y una
certificación validada. El seed agrega otros cinco entrenadores aprobados y
actividad de ejemplo para visualizar marketplace, paneles y chat.

## Pantallas del frontend

- `/`: landing pública.
- `/login` y `/registro`: autenticación.
- `/entrenadores`: marketplace con filtros.
- `/entrenadores/:id`: perfil del entrenador.
- `/panel`: dashboard adaptado al rol Cliente o Administrador.
- `/portal-entrenador`: postulación, estado de revisión o dashboard aprobado.
- `/mensajes`: conversaciones y mensajes reales.

Los assets fotográficos propios están en `frontend/public/assets`.

## Autenticación y seguridad

Salvo registro, login, recuperación y health check, las rutas requieren:

```http
Authorization: Bearer <token>
```

Los middlewares validan el JWT, el estado Activo de la cuenta, los roles y el
estado Aprobado cuando la operación exige un entrenador habilitado.

Las contraseñas se almacenan con bcrypt. Los tokens de recuperación se guardan
hasheados y vencen después de una hora.

## Endpoints

Los parámetros `:id` son identificadores numéricos.

### Auth

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/health` | Público |
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/forgot-password` | Público |
| POST | `/api/auth/reset-password` | Público |
| GET | `/api/auth/me` | Autenticado |

### Usuarios

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/users` | Administrador |
| GET | `/api/users/:id` | Administrador |
| PATCH | `/api/users/:id/status` | Administrador |

Estados: `Activo`, `Suspendido`, `Bloqueado` e `Inactivo`.

### Entrenadores y especialidades

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/trainers` | Autenticado |
| GET | `/api/trainers/:id` | Autenticado |
| GET | `/api/trainers/me` | Autenticado |
| POST | `/api/trainers/apply` | Cliente |
| PATCH | `/api/trainers/me` | Titular |
| PATCH | `/api/trainers/:id/approve` | Administrador |
| PATCH | `/api/trainers/:id/reject` | Administrador |
| GET | `/api/specialties` | Autenticado |

Filtros opcionales:

```text
GET /api/trainers?specialtyId=3&modality=Online
```

### Certificaciones

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/certifications` | Usuario con postulación |
| GET | `/api/certifications/my` | Autenticado |
| GET | `/api/certifications/pending` | Administrador |
| PATCH | `/api/certifications/:id/approve` | Administrador |
| PATCH | `/api/certifications/:id/reject` | Administrador |

### Solicitudes y chat

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/connection-requests` | Cliente |
| GET | `/api/connection-requests/my` | Cliente |
| GET | `/api/connection-requests/received` | Entrenador aprobado |
| PATCH | `/api/connection-requests/:id/accept` | Entrenador aprobado |
| PATCH | `/api/connection-requests/:id/reject` | Entrenador aprobado |
| GET | `/api/chats` | Participante |
| GET | `/api/chats/:id/messages` | Participante |
| POST | `/api/chats/:id/messages` | Participante |

### Turnos

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/turns` | Cliente con conexión aceptada |
| GET | `/api/turns/my` | Cliente |
| GET | `/api/turns/received` | Entrenador aprobado |
| PATCH | `/api/turns/:id/accept` | Entrenador aprobado |
| PATCH | `/api/turns/:id/reject` | Entrenador aprobado |
| PATCH | `/api/turns/:id/cancel` | Participante o administrador |
| PATCH | `/api/turns/:id/finish` | Entrenador aprobado |

### Pagos y calificaciones

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/payments` | Cliente |
| GET | `/api/payments/my` | Cliente |
| GET | `/api/payments/received` | Entrenador aprobado |
| GET | `/api/payments` | Administrador |
| PATCH | `/api/payments/:id/status` | Administrador |
| POST | `/api/reviews` | Cliente |
| GET | `/api/reviews/trainer/:id` | Autenticado |
| GET | `/api/reviews/pending-moderation` | Administrador |
| PATCH | `/api/reviews/:id/moderate` | Administrador |

### Reportes

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/reports/admin/overview` | Administrador |
| GET | `/api/reports/connections` | Administrador |
| GET | `/api/reports/financial` | Administrador |
| GET | `/api/reports/trainers` | Administrador |
| GET | `/api/reports/trainer/me` | Entrenador aprobado |

## Ejemplos por rol

Los ejemplos usan cURL. Guardá el `token` devuelto por cada login.

### Cliente

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@fitconnection.com","password":"cliente123"}'

curl http://localhost:4000/api/trainers \
  -H "Authorization: Bearer TOKEN_CLIENTE"

curl -X POST http://localhost:4000/api/connection-requests \
  -H "Authorization: Bearer TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"trainerId":1,"mensajeInicial":"Quiero comenzar un plan de fuerza."}'
```

Después de aceptar la conexión:

```bash
curl -X POST http://localhost:4000/api/turns \
  -H "Authorization: Bearer TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"requestId":1,"fechaInicio":"2026-07-01","horaInicio":"18:00","horaFin":"19:00","modalidad":"Online"}'
```

### Entrenador

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"entrenador@fitconnection.com","password":"entrenador123"}'

curl http://localhost:4000/api/connection-requests/received \
  -H "Authorization: Bearer TOKEN_ENTRENADOR"

curl -X PATCH http://localhost:4000/api/connection-requests/1/accept \
  -H "Authorization: Bearer TOKEN_ENTRENADOR"

curl http://localhost:4000/api/reports/trainer/me \
  -H "Authorization: Bearer TOKEN_ENTRENADOR"
```

### Administrador

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitconnection.com","password":"admin123"}'

curl -X PATCH http://localhost:4000/api/trainers/2/approve \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Perfil y documentación verificados."}'

curl http://localhost:4000/api/reports/admin/overview \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

Los IDs pueden variar; consultalos primero desde las rutas de listado.

## Comisión del entrenador

| Promedio | Comisión |
| --- | --- |
| Sin calificaciones | 15% |
| 4.5 a 5.0 | 8% |
| 4.0 a 4.4 | 12% |
| 3.5 a 3.9 | 16% |
| 3.0 a 3.4 | 20% |
| Menor a 3.0 | 25% |

Las calificaciones ocultas no participan del promedio.

## Auditoría

Se auditan:

- login exitoso y fallido;
- cambios de estado de usuario;
- aprobación y rechazo de entrenador o certificación;
- aceptación y rechazo de solicitudes;
- aceptación, rechazo, cancelación y finalización de turnos;
- cambios de estado de pago;
- creación y moderación de calificaciones.

Los intentos de login se guardan también en `LoginAttempt`.

## Email opcional

Variables del backend:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FitConnection <no-reply@fitconnection.local>
```

Si SMTP no está configurado, el email se imprime en la consola. Se utiliza para
recuperación de contraseña, revisión de certificaciones, confirmación de turnos
y aprobación de pagos.

## Variables locales completas

Backend:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET=fitconnection-local-development-secret
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

Frontend:

```env
VITE_API_URL=http://localhost:4000
```

Los secretos incluidos son exclusivamente para desarrollo local.

## Desplegar el frontend en Vercel

Creá un proyecto en Vercel conectado al repositorio y configurá:

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL`

En producción, `VITE_API_URL` debe contener el origen público del backend, sin
agregar `/api`. Por ejemplo:

```env
VITE_API_URL=https://api.fitconnection.example
```

El cliente Axios agrega centralmente el prefijo `/api` a las solicitudes. Para
desarrollo local, copiá `frontend/.env.example` como `frontend/.env`.

El archivo `frontend/vercel.json` redirige las rutas de React Router a
`index.html`, por lo que enlaces como `/login`, `/panel` o `/admin/reportes`
funcionan también al recargar la página.

## PostgreSQL en producción

Prisma utiliza dos esquemas equivalentes:

- `backend/prisma/schema.prisma`: PostgreSQL para producción.
- `backend/prisma/schema.sqlite.prisma`: SQLite para desarrollo local.

Las migraciones también están separadas:

- `backend/prisma/migrations-postgresql`: migraciones de producción.
- `backend/prisma/migrations`: migraciones locales SQLite.

Variables requeridas en producción:

```env
DATABASE_URL=postgresql://USUARIO:CLAVE@HOST:5432/BASE?schema=public
JWT_SECRET=un-secreto-largo-y-aleatorio
PORT=4000
FRONTEND_URL=https://tu-frontend.vercel.app
NODE_ENV=production
```

`FRONTEND_URL` admite varias URLs separadas por comas. El origen
`http://localhost:5173` permanece permitido para desarrollo.

Comandos de producción:

```bash
npm run build
npm run prisma:migrate
npm start
```

`prisma:migrate` usa `prisma migrate deploy`, que aplica solamente las
migraciones PostgreSQL pendientes.

### Render

Creá un PostgreSQL administrado y un Web Service con:

- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run prisma:migrate && npm start`
- **Health Check Path:** `/api/health`

Configurá `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` y
`NODE_ENV=production`. Render proporciona `PORT` automáticamente.

### Railway

Agregá un servicio PostgreSQL y un servicio para el backend:

- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run prisma:migrate && npm start`

Referenciá la `DATABASE_URL` del servicio PostgreSQL y configurá
`JWT_SECRET`, `FRONTEND_URL` y `NODE_ENV=production`.

### Vercel

Vercel puede detectar `backend/src/app.js` porque exporta la aplicación Express
como `default`. Configurá el proyecto con **Root Directory** `backend` y las
mismas variables de producción.

Ejecutá `npm run prisma:migrate` desde CI o desde un entorno con acceso a la
base antes de publicar una versión que incluya migraciones nuevas. El build
ejecuta `prisma generate`, pero no modifica automáticamente la base.

### Inicialización de datos

En una base PostgreSQL nueva:

```bash
npm run prisma:migrate
npm run prisma:seed
```

El seed actual reinicia los datos. Usalo solamente al inicializar una base
vacía o de demostración; no debe repetirse sobre datos reales de producción.

## Reiniciar o inspeccionar SQLite

El seed limpia los datos y vuelve al estado inicial:

```bash
cd fitconnection/backend
npm run prisma:seed:sqlite
```

Para abrir Prisma Studio:

```bash
npx prisma studio --config prisma.sqlite.config.js
```

## Gestión de configuración

El proyecto utiliza `main` como rama principal y ramas breves por Historia de
Usuario. Cada commit comienza con su identificador oficial, por ejemplo
`HU-USU-01: registra usuario`, y los cambios se integran mediante Pull Request
hacia `main`.

La estrategia de ramas, la convención de commits y el flujo de aprobación se
detallan en [GESTION_CONFIGURACION.md](GESTION_CONFIGURACION.md). Las líneas
base y funcionalidades incluidas en cada entrega se registran en
[VERSIONES.md](VERSIONES.md). La relación entre historias y archivos se
encuentra en [MAPEO_HISTORIAS_ARCHIVOS.md](MAPEO_HISTORIAS_ARCHIVOS.md), y las
comprobaciones del MVP en [PRUEBAS_MVP.md](PRUEBAS_MVP.md).
