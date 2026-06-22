-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "foto_perfil" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_login" TIMESTAMP(3),
    "id_estado_cuenta" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "id_usuario" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("id_usuario","id_rol")
);

-- CreateTable
CREATE TABLE "estado_cuenta" (
    "id_estado_cuenta" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_cuenta_pkey" PRIMARY KEY ("id_estado_cuenta")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "objetivo_fisico" TEXT,
    "nivel_deportivo" TEXT,
    "modalidad_preferida" TEXT,
    "ubicacion" TEXT,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "entrenador" (
    "id_entrenador" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "experiencia" INTEGER NOT NULL,
    "tarifa_base" DOUBLE PRECISION NOT NULL,
    "modalidad" TEXT NOT NULL,
    "trabaja_con_menores" BOOLEAN NOT NULL DEFAULT false,
    "calificacion_promedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentaje_comision" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "id_estado_entrenador" INTEGER NOT NULL,

    CONSTRAINT "entrenador_pkey" PRIMARY KEY ("id_entrenador")
);

-- CreateTable
CREATE TABLE "estado_entrenador" (
    "id_estado_entrenador" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_entrenador_pkey" PRIMARY KEY ("id_estado_entrenador")
);

-- CreateTable
CREATE TABLE "especialidad" (
    "id_especialidad" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "especialidad_pkey" PRIMARY KEY ("id_especialidad")
);

-- CreateTable
CREATE TABLE "entrenador_especialidad" (
    "id_entrenador" INTEGER NOT NULL,
    "id_especialidad" INTEGER NOT NULL,

    CONSTRAINT "entrenador_especialidad_pkey" PRIMARY KEY ("id_entrenador","id_especialidad")
);

-- CreateTable
CREATE TABLE "estado_certificacion" (
    "id_estado_certificacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_certificacion_pkey" PRIMARY KEY ("id_estado_certificacion")
);

-- CreateTable
CREATE TABLE "certificacion" (
    "id_certificacion" SERIAL NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_certificacion" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "entidad_emisora" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),
    "archivo" TEXT,
    "comentario_admin" TEXT,
    "fecha_revision" TIMESTAMP(3),

    CONSTRAINT "certificacion_pkey" PRIMARY KEY ("id_certificacion")
);

-- CreateTable
CREATE TABLE "estado_solicitud_conexion" (
    "id_estado_solicitud" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_solicitud_conexion_pkey" PRIMARY KEY ("id_estado_solicitud")
);

-- CreateTable
CREATE TABLE "solicitud_conexion" (
    "id_solicitud" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_solicitud" INTEGER NOT NULL,
    "mensaje_inicial" TEXT NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),

    CONSTRAINT "solicitud_conexion_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "chat" (
    "id_chat" SERIAL NOT NULL,
    "id_solicitud" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_chat" TEXT NOT NULL DEFAULT 'Activo',

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id_chat")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id_mensaje" SERIAL NOT NULL,
    "id_chat" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateTable
CREATE TABLE "estado_turno" (
    "id_estado_turno" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_turno_pkey" PRIMARY KEY ("id_estado_turno")
);

-- CreateTable
CREATE TABLE "turno" (
    "id_turno" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_solicitud" INTEGER NOT NULL,
    "id_estado_turno" INTEGER NOT NULL,
    "tarifa" DOUBLE PRECISION NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_confirmacion" TIMESTAMP(3),
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "motivo_cancelacion" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id_turno")
);

-- CreateTable
CREATE TABLE "estado_pago" (
    "id_estado_pago" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_pago_pkey" PRIMARY KEY ("id_estado_pago")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" SERIAL NOT NULL,
    "id_turno" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_pago" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comision" DOUBLE PRECISION NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "fecha_pago" TIMESTAMP(3),

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "calificacion" (
    "id_calificacion" SERIAL NOT NULL,
    "id_pago" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_moderacion" TEXT NOT NULL DEFAULT 'Visible',

    CONSTRAINT "calificacion_pkey" PRIMARY KEY ("id_calificacion")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "detalle" TEXT,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "token_recuperacion" (
    "id_token" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "token_recuperacion_pkey" PRIMARY KEY ("id_token")
);

-- CreateTable
CREATE TABLE "login_attempt" (
    "id_login_attempt" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitoso" BOOLEAN NOT NULL,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id_login_attempt")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_id_estado_cuenta_idx" ON "usuario"("id_estado_cuenta");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE INDEX "usuario_rol_id_rol_idx" ON "usuario_rol"("id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "estado_cuenta_nombre_key" ON "estado_cuenta"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_id_usuario_key" ON "cliente"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "entrenador_id_usuario_key" ON "entrenador"("id_usuario");

-- CreateIndex
CREATE INDEX "entrenador_id_estado_entrenador_idx" ON "entrenador"("id_estado_entrenador");

-- CreateIndex
CREATE UNIQUE INDEX "estado_entrenador_nombre_key" ON "estado_entrenador"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "especialidad_nombre_key" ON "especialidad"("nombre");

-- CreateIndex
CREATE INDEX "entrenador_especialidad_id_especialidad_idx" ON "entrenador_especialidad"("id_especialidad");

-- CreateIndex
CREATE UNIQUE INDEX "estado_certificacion_nombre_key" ON "estado_certificacion"("nombre");

-- CreateIndex
CREATE INDEX "certificacion_id_entrenador_idx" ON "certificacion"("id_entrenador");

-- CreateIndex
CREATE INDEX "certificacion_id_estado_certificacion_idx" ON "certificacion"("id_estado_certificacion");

-- CreateIndex
CREATE UNIQUE INDEX "estado_solicitud_conexion_nombre_key" ON "estado_solicitud_conexion"("nombre");

-- CreateIndex
CREATE INDEX "solicitud_conexion_id_cliente_idx" ON "solicitud_conexion"("id_cliente");

-- CreateIndex
CREATE INDEX "solicitud_conexion_id_entrenador_idx" ON "solicitud_conexion"("id_entrenador");

-- CreateIndex
CREATE INDEX "solicitud_conexion_id_estado_solicitud_idx" ON "solicitud_conexion"("id_estado_solicitud");

-- CreateIndex
CREATE UNIQUE INDEX "chat_id_solicitud_key" ON "chat"("id_solicitud");

-- CreateIndex
CREATE INDEX "mensaje_id_chat_fecha_envio_idx" ON "mensaje"("id_chat", "fecha_envio");

-- CreateIndex
CREATE INDEX "mensaje_id_usuario_idx" ON "mensaje"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "estado_turno_nombre_key" ON "estado_turno"("nombre");

-- CreateIndex
CREATE INDEX "turno_id_cliente_idx" ON "turno"("id_cliente");

-- CreateIndex
CREATE INDEX "turno_id_entrenador_fecha_inicio_idx" ON "turno"("id_entrenador", "fecha_inicio");

-- CreateIndex
CREATE INDEX "turno_id_solicitud_idx" ON "turno"("id_solicitud");

-- CreateIndex
CREATE INDEX "turno_id_estado_turno_idx" ON "turno"("id_estado_turno");

-- CreateIndex
CREATE UNIQUE INDEX "estado_pago_nombre_key" ON "estado_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "pago_id_turno_key" ON "pago"("id_turno");

-- CreateIndex
CREATE INDEX "pago_id_cliente_idx" ON "pago"("id_cliente");

-- CreateIndex
CREATE INDEX "pago_id_entrenador_idx" ON "pago"("id_entrenador");

-- CreateIndex
CREATE INDEX "pago_id_estado_pago_idx" ON "pago"("id_estado_pago");

-- CreateIndex
CREATE UNIQUE INDEX "calificacion_id_pago_key" ON "calificacion"("id_pago");

-- CreateIndex
CREATE INDEX "calificacion_id_cliente_idx" ON "calificacion"("id_cliente");

-- CreateIndex
CREATE INDEX "calificacion_id_entrenador_idx" ON "calificacion"("id_entrenador");

-- CreateIndex
CREATE INDEX "auditoria_id_usuario_idx" ON "auditoria"("id_usuario");

-- CreateIndex
CREATE INDEX "auditoria_fecha_idx" ON "auditoria"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "token_recuperacion_token_key" ON "token_recuperacion"("token");

-- CreateIndex
CREATE INDEX "token_recuperacion_id_usuario_idx" ON "token_recuperacion"("id_usuario");

-- CreateIndex
CREATE INDEX "login_attempt_email_fecha_idx" ON "login_attempt"("email", "fecha");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_estado_cuenta_fkey" FOREIGN KEY ("id_estado_cuenta") REFERENCES "estado_cuenta"("id_estado_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenador" ADD CONSTRAINT "entrenador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenador" ADD CONSTRAINT "entrenador_id_estado_entrenador_fkey" FOREIGN KEY ("id_estado_entrenador") REFERENCES "estado_entrenador"("id_estado_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenador_especialidad" ADD CONSTRAINT "entrenador_especialidad_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenador_especialidad" ADD CONSTRAINT "entrenador_especialidad_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidad"("id_especialidad") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacion" ADD CONSTRAINT "certificacion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacion" ADD CONSTRAINT "certificacion_id_estado_certificacion_fkey" FOREIGN KEY ("id_estado_certificacion") REFERENCES "estado_certificacion"("id_estado_certificacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_conexion" ADD CONSTRAINT "solicitud_conexion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_conexion" ADD CONSTRAINT "solicitud_conexion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_conexion" ADD CONSTRAINT "solicitud_conexion_id_estado_solicitud_fkey" FOREIGN KEY ("id_estado_solicitud") REFERENCES "estado_solicitud_conexion"("id_estado_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitud_conexion"("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id_chat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitud_conexion"("id_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_id_estado_turno_fkey" FOREIGN KEY ("id_estado_turno") REFERENCES "estado_turno"("id_estado_turno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_turno_fkey" FOREIGN KEY ("id_turno") REFERENCES "turno"("id_turno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_estado_pago_fkey" FOREIGN KEY ("id_estado_pago") REFERENCES "estado_pago"("id_estado_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pago"("id_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador"("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_recuperacion" ADD CONSTRAINT "token_recuperacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
