import "dotenv/config";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dniHashSecret =
  process.env.DNI_HASH_SECRET ??
  process.env.JWT_SECRET ??
  "fitconnection-local-development-secret";

function normalizeDni(value) {
  return String(value).replace(/[.\-\s]/g, "").trim();
}

function dniFields(value) {
  const normalized = normalizeDni(value);
  return {
    dniHash: crypto
      .createHmac("sha256", dniHashSecret)
      .update(normalized)
      .digest("hex"),
    dniMascara: `**.***.${normalized.slice(-3)}`,
    dniVerificado: true,
  };
}

const catalogs = {
  estadoCuenta: ["Activo", "Suspendido", "Bloqueado", "Inactivo"],
  estadoEntrenador: [
    "No postulado",
    "Pendiente",
    "Aprobado",
    "Rechazado",
    "Suspendido",
  ],
  estadoCertificacion: ["Pendiente", "Validado", "Rechazado", "Expirado"],
  estadoSolicitudConexion: ["Pendiente", "Aceptada", "Rechazada", "Cancelada"],
  estadoTurno: ["Disponible", "Solicitado", "Reservado", "Cancelado", "Finalizado"],
  estadoPago: ["Pendiente", "Aprobado", "Rechazado", "Reembolsado"],
  especialidades: ["Baloncesto", "Tenis", "Fuerza", "Natación", "Atletismo", "Yoga"],
};

async function resetDatabase() {
  await prisma.$transaction([
    prisma.loginAttempt.deleteMany(),
    prisma.tokenRecuperacion.deleteMany(),
    prisma.identidadBloqueada.deleteMany(),
    prisma.auditoria.deleteMany(),
    prisma.calificacion.deleteMany(),
    prisma.pago.deleteMany(),
    prisma.turno.deleteMany(),
    prisma.mensaje.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.solicitudConexion.deleteMany(),
    prisma.certificacion.deleteMany(),
    prisma.entrenadorEspecialidad.deleteMany(),
    prisma.entrenador.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.usuarioRol.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.especialidad.deleteMany(),
    prisma.estadoPago.deleteMany(),
    prisma.estadoTurno.deleteMany(),
    prisma.estadoSolicitudConexion.deleteMany(),
    prisma.estadoCertificacion.deleteMany(),
    prisma.estadoEntrenador.deleteMany(),
    prisma.estadoCuenta.deleteMany(),
    prisma.rol.deleteMany(),
  ]);
}

async function seedCatalogs() {
  await prisma.estadoCuenta.createMany({
    data: catalogs.estadoCuenta.map((nombre) => ({ nombre })),
  });
  await prisma.estadoEntrenador.createMany({
    data: catalogs.estadoEntrenador.map((nombre) => ({ nombre })),
  });
  await prisma.estadoCertificacion.createMany({
    data: catalogs.estadoCertificacion.map((nombre) => ({ nombre })),
  });
  await prisma.estadoSolicitudConexion.createMany({
    data: catalogs.estadoSolicitudConexion.map((nombre) => ({ nombre })),
  });
  await prisma.estadoTurno.createMany({
    data: catalogs.estadoTurno.map((nombre) => ({ nombre })),
  });
  await prisma.estadoPago.createMany({
    data: catalogs.estadoPago.map((nombre) => ({ nombre })),
  });
  await prisma.especialidad.createMany({
    data: catalogs.especialidades.map((nombre) => ({ nombre })),
  });
  await prisma.rol.createMany({
    data: [
      { nombre: "Cliente", descripcion: "Rol base de toda cuenta registrada." },
      {
        nombre: "Entrenador",
        descripcion: "Rol adicional otorgado tras aprobación administrativa.",
      },
      {
        nombre: "Administrador",
        descripcion: "Rol reservado a cuentas creadas por seed.",
      },
    ],
  });
}

async function seedUsers() {
  const [activo, aprobado, validado, roles, specialties] = await Promise.all([
    prisma.estadoCuenta.findUniqueOrThrow({ where: { nombre: "Activo" } }),
    prisma.estadoEntrenador.findUniqueOrThrow({ where: { nombre: "Aprobado" } }),
    prisma.estadoCertificacion.findUniqueOrThrow({ where: { nombre: "Validado" } }),
    prisma.rol.findMany(),
    prisma.especialidad.findMany(),
  ]);

  const roleId = Object.fromEntries(roles.map((role) => [role.nombre, role.idRol]));
  const specialtyId = Object.fromEntries(
    specialties.map((specialty) => [
      specialty.nombre,
      specialty.idEspecialidad,
    ]),
  );
  const [adminPassword, clientPassword, trainerPassword] = await Promise.all([
    bcrypt.hash("admin123", 12),
    bcrypt.hash("cliente123", 12),
    bcrypt.hash("entrenador123", 12),
  ]);

  await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellido: "FitConnection",
      email: "admin@fitconnection.com",
      contrasena: adminPassword,
      ...dniFields("10000001"),
      idEstadoCuenta: activo.idEstadoCuenta,
      roles: { create: { idRol: roleId.Administrador } },
    },
  });

  const client = await prisma.usuario.create({
    data: {
      nombre: "Martina",
      apellido: "Gómez",
      email: "cliente@fitconnection.com",
      contrasena: clientPassword,
      ...dniFields("10000002"),
      idEstadoCuenta: activo.idEstadoCuenta,
      roles: { create: { idRol: roleId.Cliente } },
      cliente: {
        create: {
          objetivoFisico: "Mejorar fuerza y condición física",
          nivelDeportivo: "Intermedio",
          modalidadPreferida: "Híbrida",
          ubicacion: "Buenos Aires",
        },
      },
    },
    include: { cliente: true },
  });

  const primaryTrainer = await prisma.usuario.create({
    data: {
      nombre: "Lucía",
      apellido: "Fernández",
      email: "entrenador@fitconnection.com",
      contrasena: trainerPassword,
      ...dniFields("10000003"),
      idEstadoCuenta: activo.idEstadoCuenta,
      roles: {
        create: [{ idRol: roleId.Cliente }, { idRol: roleId.Entrenador }],
      },
      cliente: {
        create: {
          objetivoFisico: "Mantener rendimiento",
          nivelDeportivo: "Avanzado",
          modalidadPreferida: "Híbrida",
          ubicacion: "Buenos Aires",
        },
      },
      entrenador: {
        create: {
          descripcion: "Preparadora física especializada en fuerza y rendimiento.",
          experiencia: 10,
          tarifaBase: 22000,
          modalidad: "Híbrida",
          trabajaConMenores: true,
          calificacionPromedio: 4.9,
          porcentajeComision: 15,
          idEstadoEntrenador: aprobado.idEstadoEntrenador,
          especialidades: {
            create: { idEspecialidad: specialtyId.Fuerza },
          },
          certificaciones: {
            create: {
              idEstadoCertificacion: validado.idEstadoCertificacion,
              titulo: "Entrenadora Nacional de Fuerza",
              entidadEmisora: "Instituto Argentino de Entrenamiento",
              fechaEmision: new Date("2018-03-15T00:00:00.000Z"),
              comentarioAdmin: "Certificación validada en el seed inicial.",
              fechaRevision: new Date(),
            },
          },
        },
      },
    },
    include: { cliente: true, entrenador: true },
  });

  const extraTrainers = [
    {
      nombre: "Sofía",
      apellido: "Reyes",
      email: "sofia.tenis@fitconnection.com",
      specialty: "Tenis",
      description:
        "Entrenadora de tenis enfocada en técnica, estrategia y preparación competitiva.",
      experience: 8,
      rate: 28000,
      modality: "Online",
      rating: 4.8,
    },
    {
      nombre: "Mateo",
      apellido: "Silva",
      email: "mateo.basket@fitconnection.com",
      specialty: "Baloncesto",
      description:
        "Coach de baloncesto especializado en fundamentos, visión de juego y rendimiento.",
      experience: 12,
      rate: 26000,
      modality: "Presencial",
      rating: 4.9,
    },
    {
      nombre: "Valentina",
      apellido: "Paz",
      email: "valentina.yoga@fitconnection.com",
      specialty: "Yoga",
      description:
        "Instructora de yoga y movilidad para deportistas, recuperación y bienestar.",
      experience: 7,
      rate: 18000,
      modality: "Online",
      rating: 4.9,
    },
    {
      nombre: "Ricardo",
      apellido: "Núñez",
      email: "ricardo.natacion@fitconnection.com",
      specialty: "Natación",
      description:
        "Entrenador de natación con experiencia en técnica, resistencia y aguas abiertas.",
      experience: 18,
      rate: 24000,
      modality: "Presencial",
      rating: 4.7,
    },
    {
      nombre: "Camila",
      apellido: "Torres",
      email: "camila.atletismo@fitconnection.com",
      specialty: "Atletismo",
      description:
        "Preparadora de running y atletismo para objetivos de 5K, 10K y media maratón.",
      experience: 6,
      rate: 21000,
      modality: "Híbrida",
      rating: 4.8,
    },
  ];

  for (const [index, item] of extraTrainers.entries()) {
    await prisma.usuario.create({
      data: {
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        contrasena: trainerPassword,
        ...dniFields(`1000000${index + 4}`),
        idEstadoCuenta: activo.idEstadoCuenta,
        roles: {
          create: [{ idRol: roleId.Cliente }, { idRol: roleId.Entrenador }],
        },
        cliente: {
          create: {
            objetivoFisico: "Rendimiento y bienestar",
            nivelDeportivo: "Avanzado",
            modalidadPreferida: item.modality,
            ubicacion: "Buenos Aires",
          },
        },
        entrenador: {
          create: {
            descripcion: item.description,
            experiencia: item.experience,
            tarifaBase: item.rate,
            modalidad: item.modality,
            trabajaConMenores: true,
            calificacionPromedio: item.rating,
            porcentajeComision: 8,
            idEstadoEntrenador: aprobado.idEstadoEntrenador,
            especialidades: {
              create: { idEspecialidad: specialtyId[item.specialty] },
            },
            certificaciones: {
              create: {
                idEstadoCertificacion: validado.idEstadoCertificacion,
                titulo: `Certificación profesional en ${item.specialty}`,
                entidadEmisora: "Federación Deportiva Argentina",
                fechaEmision: new Date("2021-03-15T00:00:00.000Z"),
                comentarioAdmin: "Certificación verificada.",
                fechaRevision: new Date(),
              },
            },
          },
        },
      },
    });
  }

  const [acceptedRequest, reservedTurn, finishedTurn, approvedPayment] =
    await Promise.all([
      prisma.estadoSolicitudConexion.findUniqueOrThrow({
        where: { nombre: "Aceptada" },
      }),
      prisma.estadoTurno.findUniqueOrThrow({ where: { nombre: "Reservado" } }),
      prisma.estadoTurno.findUniqueOrThrow({ where: { nombre: "Finalizado" } }),
      prisma.estadoPago.findUniqueOrThrow({ where: { nombre: "Aprobado" } }),
    ]);

  const connection = await prisma.solicitudConexion.create({
    data: {
      idCliente: client.cliente.idCliente,
      idEntrenador: primaryTrainer.entrenador.idEntrenador,
      idEstadoSolicitud: acceptedRequest.idEstadoSolicitud,
      mensajeInicial: "Quiero mejorar mi fuerza y condición física.",
      fechaRespuesta: new Date(),
      chat: {
        create: {
          mensajes: {
            create: [
              {
                idUsuario: client.idUsuario,
                contenido: "¡Hola! Me gustaría comenzar con un plan de fuerza.",
              },
              {
                idUsuario: primaryTrainer.idUsuario,
                contenido:
                  "¡Excelente! Revisemos tus objetivos y coordinemos el primer turno.",
                leido: false,
              },
            ],
          },
        },
      },
    },
  });

  const turnOne = await prisma.turno.create({
    data: {
      idCliente: client.cliente.idCliente,
      idEntrenador: primaryTrainer.entrenador.idEntrenador,
      idSolicitud: connection.idSolicitud,
      idEstadoTurno: reservedTurn.idEstadoTurno,
      tarifa: 22000,
      fechaConfirmacion: new Date(),
      fechaInicio: new Date("2026-06-25T00:00:00.000Z"),
      fechaFin: new Date("2026-06-25T00:00:00.000Z"),
      horaInicio: "18:00",
      horaFin: "19:00",
      modalidad: "Híbrida",
      observaciones: "Bloque de fuerza general.",
    },
  });
  const turnTwo = await prisma.turno.create({
    data: {
      idCliente: client.cliente.idCliente,
      idEntrenador: primaryTrainer.entrenador.idEntrenador,
      idSolicitud: connection.idSolicitud,
      idEstadoTurno: finishedTurn.idEstadoTurno,
      tarifa: 22000,
      fechaConfirmacion: new Date(),
      fechaInicio: new Date("2026-06-12T00:00:00.000Z"),
      fechaFin: new Date("2026-06-12T00:00:00.000Z"),
      horaInicio: "18:00",
      horaFin: "19:00",
      modalidad: "Presencial",
      observaciones: "Evaluación inicial.",
    },
  });
  await prisma.pago.create({
    data: {
      idTurno: turnTwo.idTurno,
      idCliente: client.cliente.idCliente,
      idEntrenador: primaryTrainer.entrenador.idEntrenador,
      idEstadoPago: approvedPayment.idEstadoPago,
      monto: 22000,
      descuento: 0,
      comision: 1760,
      metodoPago: "Tarjeta simulada",
      fechaPago: new Date(),
      calificacion: {
        create: {
          idCliente: client.cliente.idCliente,
          idEntrenador: primaryTrainer.entrenador.idEntrenador,
          puntuacion: 5,
          comentario: "Excelente planificación y acompañamiento.",
          estadoModeracion: "Visible",
        },
      },
    },
  });

  return { client, primaryTrainer, turnOne };
}

async function main() {
  await resetDatabase();
  await seedCatalogs();
  await seedUsers();

  console.log("Seed local completado.");
  console.log("admin@fitconnection.com / admin123");
  console.log("cliente@fitconnection.com / cliente123");
  console.log("entrenador@fitconnection.com / entrenador123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
