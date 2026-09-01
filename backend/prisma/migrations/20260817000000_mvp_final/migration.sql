UPDATE "usuario"
SET "fecha_nacimiento" = '1990-01-01T00:00:00.000Z'
WHERE "fecha_nacimiento" IS NULL;

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_usuario" (
  "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "apellido" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "contrasena" TEXT NOT NULL,
  "dni_hash" TEXT NOT NULL,
  "dni_mascara" TEXT NOT NULL,
  "dni_verificado" BOOLEAN NOT NULL DEFAULT false,
  "fecha_nacimiento" DATETIME NOT NULL,
  "telefono" TEXT,
  "foto_perfil" TEXT,
  "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ultimo_login" DATETIME,
  "id_estado_cuenta" INTEGER NOT NULL,
  CONSTRAINT "usuario_id_estado_cuenta_fkey" FOREIGN KEY ("id_estado_cuenta") REFERENCES "estado_cuenta" ("id_estado_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_usuario" (
  "id_usuario", "nombre", "apellido", "email", "contrasena", "dni_hash",
  "dni_mascara", "dni_verificado", "fecha_nacimiento", "telefono",
  "foto_perfil", "fecha_registro", "ultimo_login", "id_estado_cuenta"
)
SELECT
  "id_usuario", "nombre", "apellido", "email", "contrasena", "dni_hash",
  "dni_mascara", "dni_verificado", "fecha_nacimiento", "telefono",
  "foto_perfil", "fecha_registro", "ultimo_login", "id_estado_cuenta"
FROM "usuario";

DROP TABLE "usuario";
ALTER TABLE "new_usuario" RENAME TO "usuario";
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
CREATE UNIQUE INDEX "usuario_dni_hash_key" ON "usuario"("dni_hash");
CREATE INDEX "usuario_id_estado_cuenta_idx" ON "usuario"("id_estado_cuenta");
CREATE INDEX "usuario_dni_hash_idx" ON "usuario"("dni_hash");

ALTER TABLE "certificacion" ADD COLUMN "habilita_menores" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pago" ADD COLUMN "porcentaje_comision_aplicado" REAL NOT NULL DEFAULT 15;
UPDATE "pago"
SET "monto" = (SELECT "tarifa" FROM "turno" WHERE "turno"."id_turno" = "pago"."id_turno"),
    "porcentaje_comision_aplicado" = (SELECT "porcentaje_comision" FROM "entrenador" WHERE "entrenador"."id_entrenador" = "pago"."id_entrenador"),
    "comision" = ROUND(
      (SELECT "tarifa" FROM "turno" WHERE "turno"."id_turno" = "pago"."id_turno") *
      (SELECT "porcentaje_comision" FROM "entrenador" WHERE "entrenador"."id_entrenador" = "pago"."id_entrenador") / 100,
      2
    );
ALTER TABLE "pago" DROP COLUMN "descuento";

CREATE TABLE "disponibilidad_entrenador" (
  "id_disponibilidad" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "id_entrenador" INTEGER NOT NULL,
  "dia_semana" INTEGER NOT NULL,
  "hora_inicio" TEXT NOT NULL,
  "hora_fin" TEXT NOT NULL,
  "modalidad" TEXT NOT NULL,
  "observaciones" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "disponibilidad_entrenador_id_entrenador_fkey"
    FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "disponibilidad_entrenador_id_entrenador_dia_semana_hora_inicio_hora_fin_modalidad_key"
ON "disponibilidad_entrenador"("id_entrenador", "dia_semana", "hora_inicio", "hora_fin", "modalidad");
CREATE INDEX "disponibilidad_entrenador_id_entrenador_dia_semana_activa_idx"
ON "disponibilidad_entrenador"("id_entrenador", "dia_semana", "activa");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
