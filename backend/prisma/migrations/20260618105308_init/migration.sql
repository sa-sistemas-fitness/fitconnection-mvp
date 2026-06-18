-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME,
    "telefono" TEXT,
    "foto_perfil" TEXT,
    "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_login" DATETIME,
    "id_estado_cuenta" INTEGER NOT NULL,
    CONSTRAINT "usuario_id_estado_cuenta_fkey" FOREIGN KEY ("id_estado_cuenta") REFERENCES "estado_cuenta" ("id_estado_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "id_usuario" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,

    PRIMARY KEY ("id_usuario", "id_rol"),
    CONSTRAINT "usuario_rol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "usuario_rol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol" ("id_rol") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_cuenta" (
    "id_estado_cuenta" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "objetivo_fisico" TEXT,
    "nivel_deportivo" TEXT,
    "modalidad_preferida" TEXT,
    "ubicacion" TEXT,
    CONSTRAINT "cliente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entrenador" (
    "id_entrenador" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "experiencia" INTEGER NOT NULL,
    "tarifa_base" REAL NOT NULL,
    "modalidad" TEXT NOT NULL,
    "trabaja_con_menores" BOOLEAN NOT NULL DEFAULT false,
    "calificacion_promedio" REAL NOT NULL DEFAULT 0,
    "porcentaje_comision" REAL NOT NULL DEFAULT 15,
    "id_estado_entrenador" INTEGER NOT NULL,
    CONSTRAINT "entrenador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entrenador_id_estado_entrenador_fkey" FOREIGN KEY ("id_estado_entrenador") REFERENCES "estado_entrenador" ("id_estado_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_entrenador" (
    "id_estado_entrenador" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "especialidad" (
    "id_especialidad" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "entrenador_especialidad" (
    "id_entrenador" INTEGER NOT NULL,
    "id_especialidad" INTEGER NOT NULL,

    PRIMARY KEY ("id_entrenador", "id_especialidad"),
    CONSTRAINT "entrenador_especialidad_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entrenador_especialidad_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidad" ("id_especialidad") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_certificacion" (
    "id_estado_certificacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "certificacion" (
    "id_certificacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_certificacion" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "entidad_emisora" TEXT NOT NULL,
    "fecha_emision" DATETIME NOT NULL,
    "fecha_vencimiento" DATETIME,
    "archivo" TEXT,
    "comentario_admin" TEXT,
    "fecha_revision" DATETIME,
    CONSTRAINT "certificacion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "certificacion_id_estado_certificacion_fkey" FOREIGN KEY ("id_estado_certificacion") REFERENCES "estado_certificacion" ("id_estado_certificacion") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_solicitud_conexion" (
    "id_estado_solicitud" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "solicitud_conexion" (
    "id_solicitud" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_solicitud" INTEGER NOT NULL,
    "mensaje_inicial" TEXT NOT NULL,
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" DATETIME,
    CONSTRAINT "solicitud_conexion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "solicitud_conexion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "solicitud_conexion_id_estado_solicitud_fkey" FOREIGN KEY ("id_estado_solicitud") REFERENCES "estado_solicitud_conexion" ("id_estado_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat" (
    "id_chat" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_solicitud" INTEGER NOT NULL,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_chat" TEXT NOT NULL DEFAULT 'Activo',
    CONSTRAINT "chat_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitud_conexion" ("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id_mensaje" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_chat" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "mensaje_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat" ("id_chat") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mensaje_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_turno" (
    "id_estado_turno" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "turno" (
    "id_turno" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_solicitud" INTEGER NOT NULL,
    "id_estado_turno" INTEGER NOT NULL,
    "tarifa" REAL NOT NULL,
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_confirmacion" DATETIME,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "motivo_cancelacion" TEXT,
    "observaciones" TEXT,
    CONSTRAINT "turno_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "turno_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "turno_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitud_conexion" ("id_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "turno_id_estado_turno_fkey" FOREIGN KEY ("id_estado_turno") REFERENCES "estado_turno" ("id_estado_turno") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "estado_pago" (
    "id_estado_pago" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_turno" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "id_estado_pago" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "comision" REAL NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "fecha_pago" DATETIME,
    CONSTRAINT "pago_id_turno_fkey" FOREIGN KEY ("id_turno") REFERENCES "turno" ("id_turno") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pago_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pago_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pago_id_estado_pago_fkey" FOREIGN KEY ("id_estado_pago") REFERENCES "estado_pago" ("id_estado_pago") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "calificacion" (
    "id_calificacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pago" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_entrenador" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_moderacion" TEXT NOT NULL DEFAULT 'Visible',
    CONSTRAINT "calificacion_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pago" ("id_pago") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "calificacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "calificacion_id_entrenador_fkey" FOREIGN KEY ("id_entrenador") REFERENCES "entrenador" ("id_entrenador") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "detalle" TEXT,
    CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "token_recuperacion" (
    "id_token" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "fecha_expiracion" DATETIME NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "token_recuperacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "login_attempt" (
    "id_login_attempt" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitoso" BOOLEAN NOT NULL
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
