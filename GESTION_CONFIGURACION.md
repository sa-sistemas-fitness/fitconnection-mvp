# Gestión de configuración

## Identificación

- Producto: FitConnection.
- Responsable: SA Sistemas Fitness.
- Repositorio: `https://github.com/sa-sistemas-fitness/fitconnection-mvp.git`.
- Rama principal: `main`.
- Tabla de versiones: [VERSIONES.md](VERSIONES.md).
- Mapeo de trazabilidad: [MAPEO_HISTORIAS_ARCHIVOS.md](MAPEO_HISTORIAS_ARCHIVOS.md).

## Estrategia de ramas

Las funcionalidades se desarrollan en ramas breves creadas desde `main` y se
integran mediante Pull Request. Ramas sugeridas:

- `feature/HU-USU-01-registro`
- `feature/HU-USU-02-login`
- `feature/HU-USU-03-recuperacion`
- `feature/HU-CLI-01-busqueda`
- `feature/HU-CLI-03-turnos`
- `feature/HU-CLI-06-conexion`
- `feature/HU-ENTR-01-disponibilidad`
- `feature/HU-ENTR-05-solicitudes`
- `feature/HU-ADM-03-usuarios`
- `feature/HU-ADM-04-certificaciones`
- `feature/HU-ADM-06-reportes`
- `docs/gestion-configuracion`

Para otras historias se utiliza
`feature/<IDENTIFICADOR>-<descripcion-breve>`. Las tareas técnicas pueden usar
`chore/<IDENTIFICADOR>-<descripcion>` y las pruebas
`test/<IDENTIFICADOR>-<descripcion>`.

## Convención de commits

Formato obligatorio:

```text
IDENTIFICADOR: descripción en presente
```

Ejemplos:

```text
HU-USU-01: registra usuario
HU-CLI-01: implementa búsqueda de entrenadores
HU-ENTR-05: permite aceptar solicitud de conexión
HU-ADM-04: permite validar certificaciones
```

No se permiten mensajes genéricos ni commits vacíos. Cada commit debe contener
archivos reales relacionados con su identificador. Cuando un archivo participa
en varias historias, se incorpora en el primer commit que lo necesita y las
dependencias posteriores se documentan en el mapeo.

## Orden de la línea base

1. Commits técnicos: `CFG-01`, `BD-01`, `SEG-01` y `UI-01`.
2. Historias de usuario general: `HU-USU-01` a `HU-USU-08`.
3. Historias de cliente: `HU-CLI-01` a `HU-CLI-06`.
4. Historias de entrenador: `HU-ENTR-01` a `HU-ENTR-08`.
5. Historias de administrador: `HU-ADM-01` a `HU-ADM-06`.
6. Cierre: `DOC-01`, `DEPLOY-01` y `TEST-01`.

## Flujo con Pull Request

1. Actualizar `main`.
2. Crear una rama funcional desde `main`.
3. Implementar y validar la historia.
4. Confirmar cambios con el identificador oficial.
5. Publicar la rama y abrir un Pull Request hacia `main`.
6. Revisar trazabilidad, seguridad, pruebas y archivos incluidos.
7. Aprobar y fusionar.
8. Eliminar la rama cuando ya no sea necesaria.

Después de la reconstrucción inicial no se realizan cambios funcionales
directamente sobre `main`.

## Elementos excluidos

`.gitignore` impide versionar:

- `node_modules`;
- archivos `.env`, excepto plantillas `.env.example`;
- directorios `dist`, `build` y cobertura;
- bases SQLite locales;
- logs, cachés y temporales;
- configuración local del sistema operativo o IDE.

## Respaldo y publicación

La reconstrucción se realiza en una copia de trabajo. Antes de sustituir el
historial remoto debe conservarse una rama de respaldo del `main` anterior.
El `push` forzado no forma parte del proceso automatizado: lo ejecuta
manualmente un responsable después de revisar el historial y las validaciones.

La publicación debe usar `--force-with-lease`, que evita sobrescribir cambios
remotos que no hayan sido observados localmente.
