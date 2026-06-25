# FitConnection

FitConnection es un MVP web para conectar clientes con entrenadores deportivos
verificados. Incluye marketplace de entrenadores, postulación y portal del
entrenador, solicitudes de conexión, chat, turnos, pagos simulados,
calificaciones, recuperación de contraseña por email y panel administrativo.

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
- Marketplace de entrenadores con filtros.
- Perfil público de entrenador.
- Solicitudes de conexión cliente-entrenador.
- Chat asociado a solicitudes aceptadas.
- Gestión de turnos y disponibilidad.
- Pagos simulados, calificaciones y comisiones.
- Portal del entrenador.
- Panel administrador y reportes.
- Bloqueo de cuenta y DNI desde administración.
- Preparación para despliegue frontend/backend.

## Stack tecnológico

- Frontend: React, Vite, TailwindCSS, React Router, Axios, Lucide React y
  Recharts.
- Backend: Node.js, Express, Prisma, JWT, bcrypt, CORS, dotenv y Nodemailer.
- Base local: SQLite.
- Base producción: PostgreSQL.
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

## Configuración de `.env`

Cada integrante debe copiar las plantillas:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

En Linux/macOS:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No se deben versionar archivos `.env` reales. `.gitignore` excluye
`backend/.env`, `frontend/.env` y cualquier `.env`.

### Backend local

`backend/.env.example` documenta:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cambiar_en_entorno_real"
DNI_HASH_SECRET="cambiar_en_entorno_real"
PORT=4000
FRONTEND_URL="http://localhost:5173"

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

### Frontend local

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

Health check:

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

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

Backend:

```bash
cd backend
npm run dev
npm start
npm run build
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run prisma:studio
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run preview
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

| Rol | Email | Contraseña |
| --- | --- | --- |
| Cliente | `cliente@fitconnection.com` | `cliente123` |
| Entrenador | `entrenador@fitconnection.com` | `entrenador123` |
| Administrador | `admin@fitconnection.com` | `admin123` |

El entrenador seed está aprobado y cuenta con perfil/certificación de ejemplo.
También se cargan entrenadores adicionales para visualizar marketplace y
reportes.

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

Rama principal: `main`.

## Convención de ramas y commits

Ramas sugeridas:

```text
feature/HU-01-auth
feature/HU-04-entrenadores
feature/HU-06-conexiones
feature/HU-07-chat
feature/HU-08-turnos
feature/HU-09-pagos-calificaciones
feature/HU-10-portal-entrenador
feature/ADMIN-01-admin
docs/gestion-configuracion
```

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
- Revisá logs de `[SMTP]` al iniciar backend.
- Si SMTP está vacío, buscá el enlace en consola.

### El frontend no conecta al backend

Verificá `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000"
```

### Navbar o menú de usuario

El menú de usuario se renderiza por encima de la interfaz y debe mostrar siempre
`Mi perfil`, `Cambiar contraseña` y `Cerrar sesión`.
