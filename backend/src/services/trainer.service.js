import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import {
  optionalString,
  requiredNumber,
  requiredString,
} from "../utils/request.js";
import { audit } from "./audit.service.js";

const trainerInclude = {
  estado: true,
  usuario: {
    select: {
      idUsuario: true,
      nombre: true,
      apellido: true,
      email: true,
      fotoPerfil: true,
      telefono: true,
      estadoCuenta: true,
      cliente: {
        select: {
          ubicacion: true,
          nivelDeportivo: true,
        },
      },
    },
  },
  especialidades: { include: { especialidad: true } },
  certificaciones: { include: { estado: true } },
  _count: {
    select: {
      calificaciones: true,
      turnos: true,
      solicitudes: true,
    },
  },
};

function trainerData(body) {
  return {
    descripcion: requiredString(body.descripcion, "descripcion"),
    experiencia: requiredNumber(body.experiencia, "experiencia", { min: 0 }),
    tarifaBase: requiredNumber(body.tarifaBase, "tarifaBase", { min: 0 }),
    modalidad: requiredString(body.modalidad, "modalidad"),
    trabajaConMenores: Boolean(body.trabajaConMenores),
  };
}

async function specialtyConnections(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Seleccioná al menos una especialidad.");
  }
  const uniqueIds = [...new Set(ids.map(Number))];
  const count = await prisma.especialidad.count({
    where: { idEspecialidad: { in: uniqueIds } },
  });
  if (count !== uniqueIds.length) {
    throw new ApiError(400, "Una o más especialidades no existen.");
  }
  return uniqueIds.map((idEspecialidad) => ({ idEspecialidad }));
}

export async function listApprovedTrainers(query) {
  const filters = {
    estado: { nombre: "Aprobado" },
    usuario: { estadoCuenta: { nombre: "Activo" } },
  };
  if (query.specialtyId) {
    const specialtyId = Number(query.specialtyId);
    if (!Number.isInteger(specialtyId) || specialtyId <= 0) {
      throw new ApiError(400, "specialtyId inválido.");
    }
    filters.especialidades = {
      some: { idEspecialidad: specialtyId },
    };
  }
  if (query.modality) filters.modalidad = String(query.modality);

  return prisma.entrenador.findMany({
    where: filters,
    include: trainerInclude,
    orderBy: [{ calificacionPromedio: "desc" }, { experiencia: "desc" }],
  });
}

export async function getTrainer(id, auth) {
  const trainer = await prisma.entrenador.findUnique({
    where: { idEntrenador: id },
    include: trainerInclude,
  });
  if (!trainer) throw new ApiError(404, "Entrenador no encontrado.");
  const canInspect =
    trainer.estado.nombre === "Aprobado" ||
    auth.roles.includes("Administrador") ||
    trainer.idUsuario === auth.userId;
  if (!canInspect) throw new ApiError(404, "Entrenador no encontrado.");
  return trainer;
}

export async function getMyTrainer(userId) {
  const trainer = await prisma.entrenador.findUnique({
    where: { idUsuario: userId },
    include: trainerInclude,
  });
  if (!trainer) throw new ApiError(404, "Todavía no tenés una postulación.");
  if (trainer.estado.nombre !== "Rechazado") return trainer;

  const rejectionAudit = await prisma.auditoria.findFirst({
    where: {
      accion: "RECHAZAR_ENTRENADOR",
      tablaAfectada: "entrenador",
      detalle: { contains: `"trainerId":${trainer.idEntrenador}` },
    },
    orderBy: { fecha: "desc" },
  });
  let rejectionReason = null;
  try {
    rejectionReason = rejectionAudit?.detalle
      ? JSON.parse(rejectionAudit.detalle).comment ?? null
      : null;
  } catch {
    rejectionReason = null;
  }
  return { ...trainer, rejectionReason };
}

export async function applyAsTrainer(userId, body) {
  const connections = await specialtyConnections(body.specialtyIds);
  const pending = await prisma.estadoEntrenador.findUniqueOrThrow({
    where: { nombre: "Pendiente" },
  });
  const existing = await prisma.entrenador.findUnique({
    where: { idUsuario: userId },
    include: { estado: true },
  });

  if (
    existing &&
    !["Rechazado", "No postulado"].includes(existing.estado.nombre)
  ) {
    throw new ApiError(409, "Ya existe una postulación activa.");
  }

  const trainer = await prisma.$transaction(async (tx) => {
    if (body.fotoPerfil !== undefined) {
      await tx.usuario.update({
        where: { idUsuario: userId },
        data: { fotoPerfil: optionalString(body.fotoPerfil) },
      });
    }
    if (existing) {
      return tx.entrenador.update({
        where: { idEntrenador: existing.idEntrenador },
        data: {
          ...trainerData(body),
          idEstadoEntrenador: pending.idEstadoEntrenador,
          especialidades: {
            deleteMany: {},
            create: connections,
          },
        },
      });
    }
    return tx.entrenador.create({
      data: {
        idUsuario: userId,
        ...trainerData(body),
        porcentajeComision: 15,
        idEstadoEntrenador: pending.idEstadoEntrenador,
        especialidades: { create: connections },
      },
    });
  });
  return getMyTrainer(trainer.idUsuario);
}

export async function updateMyTrainer(userId, body) {
  const trainer = await prisma.entrenador.findUnique({ where: { idUsuario: userId } });
  if (!trainer) throw new ApiError(404, "No tenés perfil de entrenador.");

  const data = {};
  if (body.descripcion !== undefined) {
    data.descripcion = requiredString(body.descripcion, "descripcion");
  }
  if (body.experiencia !== undefined) {
    data.experiencia = requiredNumber(body.experiencia, "experiencia");
  }
  if (body.tarifaBase !== undefined) {
    data.tarifaBase = requiredNumber(body.tarifaBase, "tarifaBase");
  }
  if (body.modalidad !== undefined) {
    data.modalidad = requiredString(body.modalidad, "modalidad");
  }
  if (body.trabajaConMenores !== undefined) {
    data.trabajaConMenores = Boolean(body.trabajaConMenores);
  }
  if (body.specialtyIds) {
    const connections = await specialtyConnections(body.specialtyIds);
    data.especialidades = {
      deleteMany: {},
      create: connections,
    };
  }
  await prisma.$transaction(async (tx) => {
    if (body.fotoPerfil !== undefined) {
      await tx.usuario.update({
        where: { idUsuario: userId },
        data: { fotoPerfil: optionalString(body.fotoPerfil) },
      });
    }
    await tx.entrenador.update({
      where: { idEntrenador: trainer.idEntrenador },
      data,
    });
  });
  return getMyTrainer(userId);
}

async function reviewTrainer(id, approved, actor, comment) {
  const trainer = await prisma.entrenador.findUnique({
    where: { idEntrenador: id },
    include: { estado: true, usuario: true },
  });
  if (!trainer) throw new ApiError(404, "Postulación no encontrada.");
  if (trainer.estado.nombre !== "Pendiente") {
    throw new ApiError(409, "La postulación ya fue revisada.");
  }
  const state = await prisma.estadoEntrenador.findUniqueOrThrow({
    where: { nombre: approved ? "Aprobado" : "Rechazado" },
  });
  const trainerRole = await prisma.rol.findUniqueOrThrow({
    where: { nombre: "Entrenador" },
  });

  await prisma.$transaction(async (tx) => {
    await tx.entrenador.update({
      where: { idEntrenador: id },
      data: { idEstadoEntrenador: state.idEstadoEntrenador },
    });
    if (approved) {
      await tx.usuarioRol.upsert({
        where: {
          idUsuario_idRol: {
            idUsuario: trainer.idUsuario,
            idRol: trainerRole.idRol,
          },
        },
        create: { idUsuario: trainer.idUsuario, idRol: trainerRole.idRol },
        update: {},
      });
    } else {
      await tx.usuarioRol.deleteMany({
        where: { idUsuario: trainer.idUsuario, idRol: trainerRole.idRol },
      });
    }
  });

  await audit({
    userId: actor.userId,
    action: approved ? "APROBAR_ENTRENADOR" : "RECHAZAR_ENTRENADOR",
    table: "entrenador",
    ip: actor.ip,
    detail: { trainerId: id, comment: optionalString(comment) },
  });
  return getTrainer(id, { roles: ["Administrador"], userId: actor.userId });
}

export const approveTrainer = (id, actor, comment) =>
  reviewTrainer(id, true, actor, comment);
export const rejectTrainer = (id, actor, comment) =>
  reviewTrainer(id, false, actor, comment);
