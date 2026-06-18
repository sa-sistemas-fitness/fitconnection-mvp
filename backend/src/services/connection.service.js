import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { requiredString } from "../utils/request.js";
import { audit } from "./audit.service.js";

const include = {
  estado: true,
  cliente: {
    include: {
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, fotoPerfil: true },
      },
    },
  },
  entrenador: {
    include: {
      estado: true,
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, fotoPerfil: true },
      },
    },
  },
  chat: true,
};

export async function createConnectionRequest(auth, body) {
  if (!auth.clientId) throw new ApiError(403, "Se requiere un perfil Cliente.");
  const trainerId = Number(body.trainerId ?? body.idEntrenador);
  const trainer = await prisma.entrenador.findUnique({
    where: { idEntrenador: trainerId },
    include: { estado: true, usuario: { include: { estadoCuenta: true } } },
  });
  if (
    !trainer ||
    trainer.estado.nombre !== "Aprobado" ||
    trainer.usuario.estadoCuenta.nombre !== "Activo"
  ) {
    throw new ApiError(404, "Entrenador aprobado no encontrado.");
  }
  if (trainer.idUsuario === auth.userId) {
    throw new ApiError(400, "No podés enviarte una solicitud a vos mismo.");
  }

  const duplicate = await prisma.solicitudConexion.findFirst({
    where: {
      idCliente: auth.clientId,
      idEntrenador: trainerId,
      estado: { nombre: "Pendiente" },
    },
  });
  if (duplicate) {
    throw new ApiError(409, "Ya existe una solicitud pendiente para este entrenador.");
  }
  const pending = await prisma.estadoSolicitudConexion.findUniqueOrThrow({
    where: { nombre: "Pendiente" },
  });
  return prisma.solicitudConexion.create({
    data: {
      idCliente: auth.clientId,
      idEntrenador: trainerId,
      idEstadoSolicitud: pending.idEstadoSolicitud,
      mensajeInicial: requiredString(body.mensajeInicial, "mensajeInicial"),
    },
    include,
  });
}

export function listMyRequests(clientId) {
  if (!clientId) return [];
  return prisma.solicitudConexion.findMany({
    where: { idCliente: clientId },
    include,
    orderBy: { fechaSolicitud: "desc" },
  });
}

export function listReceivedRequests(trainerId) {
  return prisma.solicitudConexion.findMany({
    where: { idEntrenador: trainerId },
    include,
    orderBy: { fechaSolicitud: "desc" },
  });
}

async function respondToRequest(id, accepted, auth, ip) {
  const request = await prisma.solicitudConexion.findUnique({
    where: { idSolicitud: id },
    include: { estado: true },
  });
  if (!request) throw new ApiError(404, "Solicitud no encontrada.");
  if (request.idEntrenador !== auth.trainerId) {
    throw new ApiError(403, "La solicitud pertenece a otro entrenador.");
  }
  if (request.estado.nombre !== "Pendiente") {
    throw new ApiError(409, "La solicitud ya fue respondida.");
  }

  const state = await prisma.estadoSolicitudConexion.findUniqueOrThrow({
    where: { nombre: accepted ? "Aceptada" : "Rechazada" },
  });
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.solicitudConexion.update({
      where: { idSolicitud: id },
      data: {
        idEstadoSolicitud: state.idEstadoSolicitud,
        fechaRespuesta: new Date(),
      },
      include,
    });
    if (accepted) {
      await tx.chat.create({
        data: { idSolicitud: id, estadoChat: "Activo" },
      });
    }
    return result;
  });
  await audit({
    userId: auth.userId,
    action: accepted ? "ACEPTAR_SOLICITUD" : "RECHAZAR_SOLICITUD",
    table: "solicitud_conexion",
    ip,
    detail: { requestId: id },
  });
  return prisma.solicitudConexion.findUnique({
    where: { idSolicitud: updated.idSolicitud },
    include,
  });
}

export const acceptRequest = (id, auth, ip) =>
  respondToRequest(id, true, auth, ip);
export const rejectRequest = (id, auth, ip) =>
  respondToRequest(id, false, auth, ip);
