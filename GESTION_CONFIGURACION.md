# Gestión de configuración

## Identificación del producto

- Producto: FitConnection.
- Responsable: SA Sistemas Fitness.
- Repositorio GitHub: `sa-sistemas-fitness/fitconnection-mvp`.
- Rama principal: `main`.
- Registro de versiones: [VERSIONES.md](VERSIONES.md).

## Estrategia de ramas

El desarrollo se organiza en ramas breves por funcionalidad o caso de uso. Las
ramas sugeridas son:

- `feature/HU-01-auth`
- `feature/HU-04-entrenadores`
- `feature/HU-06-conexiones`
- `feature/HU-07-chat`
- `feature/HU-08-turnos`
- `feature/HU-09-pagos-calificaciones`
- `feature/HU-10-portal-entrenador`
- `feature/ADMIN-01-admin`
- `docs/gestion-configuracion`

Cuando una tarea sea responsabilidad exclusiva de un integrante, puede usarse
`feature/<identificador>-<integrante>`, manteniendo el identificador del caso de
uso.

## Convención de commits

Cada commit comienza con el identificador del caso de uso, historia de usuario
o tarea de configuración, seguido de una descripción breve en presente:

```text
<IDENTIFICADOR>: <descripción>
```

Secuencia definida para reconstruir el historial:

1. `CFG-01: configuración inicial del repositorio`
2. `BD-01: agrega modelo de datos y seed inicial`
3. `HU-01: agrega registro de cliente y autenticación`
4. `HU-04: agrega búsqueda y perfil de entrenadores`
5. `HU-06: implementa solicitudes de conexión`
6. `HU-07: agrega chat cliente-entrenador`
7. `HU-08: implementa gestión de turnos`
8. `HU-09: agrega pagos y calificaciones`
9. `HU-10: agrega portal del entrenador`
10. `ADMIN-01: agrega panel administrador y reportes`
11. `DEPLOY-01: prepara despliegue en Vercel, Render y PostgreSQL`
12. `DOC-01: agrega gestión de configuración y tabla de versiones`

Los commits deben contener cambios relacionados con un único identificador. No
se deben incluir dependencias generadas, secretos, bases SQLite locales,
compilaciones ni archivos temporales.

## Flujo de trabajo

1. Actualizar `main` desde el repositorio remoto.
2. Crear una rama desde `main` con uno de los nombres acordados.
3. Implementar y verificar la funcionalidad.
4. Crear commits pequeños que respeten la convención.
5. Publicar la rama en GitHub.
6. Abrir un Pull Request hacia `main`.
7. Revisar trazabilidad, pruebas y archivos incluidos.
8. Aprobar y fusionar el Pull Request.
9. Eliminar la rama de funcionalidad cuando ya no sea necesaria.

No se realizan commits funcionales directamente sobre `main`. La reconstrucción
inicial del historial es una operación excepcional; luego de publicarla, todo
cambio debe ingresar mediante Pull Request.

## Versionado y líneas base

La tabla de [VERSIONES.md](VERSIONES.md) registra las líneas base funcionales.
Al publicar una nueva versión se debe:

1. actualizar la tabla de versiones;
2. verificar que `main` contenga únicamente cambios aprobados;
3. crear una etiqueta Git anotada, por ejemplo
   `git tag -a v1.0 -m "FitConnection MVP v1.0"`;
4. publicar la etiqueta con `git push origin v1.0`.

## Protección de información

El archivo `.gitignore` excluye dependencias, variables de entorno, resultados
de compilación, cobertura, logs, temporales y bases de datos locales. Los
archivos `.env.example` pueden versionarse siempre que no contengan secretos
reales.

## Reconstrucción controlada del historial

Los siguientes comandos están preparados para PowerShell y deben ejecutarse
desde la raíz de `fitconnection`. Crean un historial lineal en `main`, pero
cada commit funcional se realiza primero en su rama correspondiente.

Antes de comenzar, se debe conservar una copia completa de la carpeta del
proyecto. Si la copia de trabajo todavía contiene un historial anterior,
renombrar su directorio `.git` como respaldo antes de ejecutar `git init`.

### 1. Inicialización y configuración base

```powershell
git init -b main
git remote add origin https://github.com/sa-sistemas-fitness/fitconnection-mvp.git

git add .gitignore backend/.env.example backend/package.json backend/package-lock.json
git add backend/prisma.config.js backend/prisma.sqlite.config.js
git add backend/src/app.js backend/src/server.js backend/src/config backend/src/errors
git add backend/src/lib backend/src/middleware/error-handler.js backend/src/utils
git add frontend/.env.example frontend/package.json frontend/package-lock.json
git add frontend/index.html frontend/postcss.config.js frontend/tailwind.config.js frontend/vite.config.js
git add frontend/src/main.jsx frontend/src/App.jsx frontend/src/index.css frontend/src/api
git add frontend/src/components/Brand.jsx frontend/src/components/Layout.jsx
git add frontend/src/components/Navbar.jsx frontend/src/components/RequestState.jsx
git add frontend/src/components/Routes.jsx frontend/src/components/ui.jsx
git add frontend/src/lib/format.js frontend/src/pages/LandingPage.jsx
git commit -m "CFG-01: configuración inicial del repositorio"
```

### 2. Modelo de datos

```powershell
git switch -c feature/BD-01-modelo-datos
git add backend/prisma/schema.sqlite.prisma backend/prisma/migrations backend/prisma/seed.js
git commit -m "BD-01: agrega modelo de datos y seed inicial"
git switch main
git merge --ff-only feature/BD-01-modelo-datos
```

### 3. Registro y autenticación

```powershell
git switch -c feature/HU-01-auth
git add backend/src/controllers/auth.controller.js backend/src/routes/auth.routes.js
git add backend/src/services/auth.service.js backend/src/services/email.service.js
git add backend/src/middleware/auth.js frontend/src/context/AuthContext.jsx
git add frontend/src/pages/AuthPages.jsx
git commit -m "HU-01: agrega registro de cliente y autenticación"
git switch main
git merge --ff-only feature/HU-01-auth
```

### 4. Búsqueda y perfil de entrenadores

```powershell
git switch -c feature/HU-04-entrenadores
git add backend/src/controllers/trainer.controller.js backend/src/controllers/specialty.controller.js
git add backend/src/routes/trainer.routes.js backend/src/routes/specialty.routes.js
git add backend/src/services/trainer.service.js
git add frontend/public/assets frontend/src/components/TrainerAvatar.jsx
git add frontend/src/components/TrainerCard.jsx frontend/src/pages/MarketplacePage.jsx
git add frontend/src/pages/TrainerProfilePage.jsx
git commit -m "HU-04: agrega búsqueda y perfil de entrenadores"
git switch main
git merge --ff-only feature/HU-04-entrenadores
```

### 5. Solicitudes de conexión

```powershell
git switch -c feature/HU-06-conexiones
git add backend/src/controllers/connection.controller.js backend/src/routes/connection.routes.js
git add backend/src/services/connection.service.js frontend/src/pages/ClientDashboardPage.jsx
git commit -m "HU-06: implementa solicitudes de conexión"
git switch main
git merge --ff-only feature/HU-06-conexiones
```

### 6. Chat

```powershell
git switch -c feature/HU-07-chat
git add backend/src/controllers/chat.controller.js backend/src/routes/chat.routes.js
git add backend/src/services/chat.service.js frontend/src/pages/ChatPage.jsx
git commit -m "HU-07: agrega chat cliente-entrenador"
git switch main
git merge --ff-only feature/HU-07-chat
```

### 7. Turnos

```powershell
git switch -c feature/HU-08-turnos
git add backend/src/controllers/turn.controller.js backend/src/routes/turn.routes.js
git add backend/src/services/turn.service.js frontend/src/pages/MyTurnsPage.jsx
git commit -m "HU-08: implementa gestión de turnos"
git switch main
git merge --ff-only feature/HU-08-turnos
```

### 8. Pagos y calificaciones

```powershell
git switch -c feature/HU-09-pagos-calificaciones
git add backend/src/controllers/payment.controller.js backend/src/controllers/review.controller.js
git add backend/src/routes/payment.routes.js backend/src/routes/review.routes.js
git add backend/src/services/payment.service.js backend/src/services/review.service.js
git add backend/src/services/commission.service.js
git commit -m "HU-09: agrega pagos y calificaciones"
git switch main
git merge --ff-only feature/HU-09-pagos-calificaciones
```

### 9. Portal del entrenador

```powershell
git switch -c feature/HU-10-portal-entrenador
git add backend/src/controllers/certification.controller.js backend/src/routes/certification.routes.js
git add backend/src/services/certification.service.js
git add frontend/src/components/TrainerApplicationForm.jsx frontend/src/components/TrainerCharts.jsx
git add frontend/src/lib/trainerAnalytics.js
git add frontend/src/pages/TrainerAvailabilityPage.jsx frontend/src/pages/TrainerCertificationsPage.jsx
git add frontend/src/pages/TrainerDashboardPage.jsx frontend/src/pages/TrainerPaymentsPage.jsx
git add frontend/src/pages/TrainerPortalPage.jsx frontend/src/pages/TrainerProfessionalProfilePage.jsx
git add frontend/src/pages/TrainerReportsPage.jsx frontend/src/pages/TrainerRequestsPage.jsx
git add frontend/src/pages/TrainerTurnsPage.jsx
git commit -m "HU-10: agrega portal del entrenador"
git switch main
git merge --ff-only feature/HU-10-portal-entrenador
```

### 10. Administración y reportes

```powershell
git switch -c feature/ADMIN-01-admin
git add backend/src/controllers/user.controller.js backend/src/controllers/report.controller.js
git add backend/src/routes/user.routes.js backend/src/routes/report.routes.js
git add backend/src/services/user.service.js backend/src/services/report.service.js
git add backend/src/services/audit.service.js frontend/src/pages/Admin*.jsx
git commit -m "ADMIN-01: agrega panel administrador y reportes"
git switch main
git merge --ff-only feature/ADMIN-01-admin
```

### 11. Despliegue

```powershell
git switch -c chore/DEPLOY-01-deploy
git add backend/prisma/schema.prisma backend/prisma/migrations-postgresql
git add frontend/vercel.json
git commit -m "DEPLOY-01: prepara despliegue en Vercel, Render y PostgreSQL"
git switch main
git merge --ff-only chore/DEPLOY-01-deploy
```

### 12. Documentación de configuración

```powershell
git switch -c docs/gestion-configuracion
git add README.md VERSIONES.md GESTION_CONFIGURACION.md
git commit -m "DOC-01: agrega gestión de configuración y tabla de versiones"
git switch main
git merge --ff-only docs/gestion-configuracion
```

### 13. Verificación

```powershell
git status --short
git log --oneline --decorate --graph --all
git ls-files | Select-String -Pattern 'node_modules|\.env$|dist/|\.db$|\.log$|\.err$'
```

`git status --short` debe quedar vacío y el último comando no debe devolver
archivos. Si aparece un archivo fuente sin seguimiento, se debe identificar su
caso de uso y agregarlo al commit correspondiente antes de publicar.

### 14. Respaldo y publicación

Si el repositorio remoto ya tiene una rama `main`, respaldarla antes de
reemplazarla:

```powershell
git fetch origin main
git branch backup/historial-anterior origin/main
git push origin backup/historial-anterior
```

Publicar las ramas de trabajo y, por último, reemplazar `main`:

```powershell
git push -u origin feature/BD-01-modelo-datos
git push -u origin feature/HU-01-auth
git push -u origin feature/HU-04-entrenadores
git push -u origin feature/HU-06-conexiones
git push -u origin feature/HU-07-chat
git push -u origin feature/HU-08-turnos
git push -u origin feature/HU-09-pagos-calificaciones
git push -u origin feature/HU-10-portal-entrenador
git push -u origin feature/ADMIN-01-admin
git push -u origin chore/DEPLOY-01-deploy
git push -u origin docs/gestion-configuracion
git push --force-with-lease -u origin main
```

Si GitHub tiene protección contra `force push` en `main`, un administrador debe
desactivarla temporalmente y volver a activarla inmediatamente después de la
publicación.
