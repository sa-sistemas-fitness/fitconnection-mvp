PRAGMA foreign_keys=OFF;

-- RedefineTables
CREATE TABLE "new_usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "dni_hash" TEXT NOT NULL,
    "dni_mascara" TEXT NOT NULL,
    "dni_verificado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_nacimiento" DATETIME,
    "telefono" TEXT,
    "foto_perfil" TEXT,
    "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_login" DATETIME,
    "id_estado_cuenta" INTEGER NOT NULL,
    CONSTRAINT "usuario_id_estado_cuenta_fkey" FOREIGN KEY ("id_estado_cuenta") REFERENCES "estado_cuenta" ("id_estado_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_usuario" (
  "id_usuario",
  "nombre",
  "apellido",
  "email",
  "contrasena",
  "dni_hash",
  "dni_mascara",
  "dni_verificado",
  "fecha_nacimiento",
  "telefono",
  "foto_perfil",
  "fecha_registro",
  "ultimo_login",
  "id_estado_cuenta"
)
SELECT
  "id_usuario",
  "nombre",
  "apellido",
  "email",
  "contrasena",
  'legacy-user-' || "id_usuario",
  '**.***.' || substr('000' || "id_usuario", -3, 3),
  false,
  "fecha_nacimiento",
  "telefono",
  "foto_perfil",
  "fecha_registro",
  "ultimo_login",
  "id_estado_cuenta"
FROM "usuario";

DROP TABLE "usuario";
ALTER TABLE "new_usuario" RENAME TO "usuario";

-- CreateTable
CREATE TABLE "identidad_bloqueada" (
    "id_identidad_bloqueada" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dni_hash" TEXT NOT NULL,
    "dni_mascara" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_bloqueo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_admin" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_desbloqueo" DATETIME,
    CONSTRAINT "identidad_bloqueada_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
CREATE UNIQUE INDEX "usuario_dni_hash_key" ON "usuario"("dni_hash");
CREATE INDEX "usuario_id_estado_cuenta_idx" ON "usuario"("id_estado_cuenta");
CREATE INDEX "usuario_dni_hash_idx" ON "usuario"("dni_hash");
CREATE INDEX "identidad_bloqueada_dni_hash_activa_idx" ON "identidad_bloqueada"("dni_hash", "activa");
CREATE INDEX "identidad_bloqueada_id_admin_idx" ON "identidad_bloqueada"("id_admin");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
