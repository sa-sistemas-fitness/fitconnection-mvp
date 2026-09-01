UPDATE "usuario"
SET "fecha_nacimiento" = TIMESTAMP '1990-01-01 00:00:00'
WHERE "fecha_nacimiento" IS NULL;
ALTER TABLE "usuario" ALTER COLUMN "fecha_nacimiento" SET NOT NULL;

ALTER TABLE "certificacion" ADD COLUMN "habilita_menores" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pago" ADD COLUMN "porcentaje_comision_aplicado" DOUBLE PRECISION NOT NULL DEFAULT 15;
UPDATE "pago" AS p
SET "monto" = t."tarifa",
    "porcentaje_comision_aplicado" = e."porcentaje_comision",
    "comision" = ROUND((t."tarifa" * e."porcentaje_comision" / 100)::numeric, 2)::double precision
FROM "turno" AS t, "entrenador" AS e
WHERE t."id_turno" = p."id_turno" AND e."id_entrenador" = p."id_entrenador";
ALTER TABLE "pago" DROP COLUMN "descuento";

CREATE TABLE "disponibilidad_entrenador" (
  "id_disponibilidad" SERIAL NOT NULL,
  "id_entrenador" INTEGER NOT NULL,
  "dia_semana" INTEGER NOT NULL,
  "hora_inicio" TEXT NOT NULL,
  "hora_fin" TEXT NOT NULL,
  "modalidad" TEXT NOT NULL,
  "observaciones" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "disponibilidad_entrenador_pkey" PRIMARY KEY ("id_disponibilidad"),
  CONSTRAINT "disponibilidad_entrenador_id_entrenador_fkey"
    FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "disponibilidad_entrenador_id_entrenador_dia_semana_hora_inicio_hora_fin_modalidad_key"
ON "disponibilidad_entrenador"("id_entrenador", "dia_semana", "hora_inicio", "hora_fin", "modalidad");
CREATE INDEX "disponibilidad_entrenador_id_entrenador_dia_semana_activa_idx"
ON "disponibilidad_entrenador"("id_entrenador", "dia_semana", "activa");
