import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { requiredString } from "../utils/request.js";

const chatInclude = {
  solicitud: {
    include: {
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
          usuario: {
            select: { idUsuario: true, nombre: true, apellido: true, fotoPerfil: true },
          },
        },
      },
    },
  },
  mensajes: {
    take: 1,
    orderBy: { fechaEnvio: "desc" },
    include: {
      usuario: { select: { idUsuario: true, nombre: true, apellido: true } },
    },
  },
};

function participantFilter(auth) {
  return {
    OR: [
      ...(auth.clientId
        ? [{ solicitud: { idCliente: auth.clientId } }]
        : []),
      ...(auth.trainerId
        ? [{ solicitud: { idEntrenador: auth.trainerId } }]
        : []),
    ],
  };
}

async function getAuthorizedChat(id, auth) {
  const chat = await prisma.chat.findFirst({
    where: { idChat: id, ...participantFilter(auth) },
    include: { solicitud: { include: { estado: true } } },
  });
  if (!chat) throw new ApiError(404, "Chat no encontrado.");
  if (chat.solicitud.estado.nombre !== "Aceptada" || chat.estadoChat !== "Activo") {
    throw new ApiError(409, "El chat no está activo.");
  }
  return chat;
}

export function listChats(auth) {
  return prisma.chat.findMany({
    where: participantFilter(auth),
    include: chatInclude,
    orderBy: { fechaCreacion: "desc" },
  });
}

export async function listMessages(id, auth) {
  await getAuthorizedChat(id, auth);
  await prisma.mensaje.updateMany({
    where: { idChat: id, idUsuario: { not: auth.userId }, leido: false },
    data: { leido: true },
  });
  return prisma.mensaje.findMany({
    where: { idChat: id },
    include: {
      usuario: { select: { idUsuario: true, nombre: true, apellido: true } },
    },
    orderBy: { fechaEnvio: "asc" },
  });
}

export async function createMessage(id, auth, body) {
  await getAuthorizedChat(id, auth);
  return prisma.mensaje.create({
    data: {
      idChat: id,
      idUsuario: auth.userId,
      contenido: requiredString(body.contenido, "contenido"),
    },
    include: {
      usuario: { select: { idUsuario: true, nombre: true, apellido: true } },
    },
  });
}
