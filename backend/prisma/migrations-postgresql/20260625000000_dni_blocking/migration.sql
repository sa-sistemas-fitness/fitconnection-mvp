-- AlterTable
ALTER TABLE "usuario" ADD COLUMN "dni_hash" TEXT;
ALTER TABLE "usuario" ADD COLUMN "dni_mascara" TEXT;
ALTER TABLE "usuario" ADD COLUMN "dni_verificado" BOOLEAN NOT NULL DEFAULT false;

-- Backfill para bases existentes sin usar DNI reales.
UPDATE "usuario"
SET
  "dni_hash" = 'legacy-user-' || "id_usuario",
  "dni_mascara" = '**.***.' || lpad("id_usuario"::text, 3, '0')
WHERE "dni_hash" IS NULL;

ALTER TABLE "usuario" ALTER COLUMN "dni_hash" SET NOT NULL;
ALTER TABLE "usuario" ALTER COLUMN "dni_mascara" SET NOT NULL;

-- CreateTable
CREATE TABLE "identidad_bloqueada" (
    "id_identidad_bloqueada" SERIAL NOT NULL,
    "dni_hash" TEXT NOT NULL,
    "dni_mascara" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha_bloqueo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_admin" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_desbloqueo" TIMESTAMP(3),

    CONSTRAINT "identidad_bloqueada_pkey" PRIMARY KEY ("id_identidad_bloqueada")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_dni_hash_key" ON "usuario"("dni_hash");
CREATE INDEX "usuario_dni_hash_idx" ON "usuario"("dni_hash");
CREATE INDEX "identidad_bloqueada_dni_hash_activa_idx" ON "identidad_bloqueada"("dni_hash", "activa");
CREATE INDEX "identidad_bloqueada_id_admin_idx" ON "identidad_bloqueada"("id_admin");

-- AddForeignKey
ALTER TABLE "identidad_bloqueada" ADD CONSTRAINT "identidad_bloqueada_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
