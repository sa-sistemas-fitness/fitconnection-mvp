import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import {
  optionalString,
  requiredDate,
  requiredString,
} from "../utils/request.js";
import { audit } from "./audit.service.js";
import { sendEmail } from "./email.service.js";

const include = {
  estado: true,
  cliente: {
    include: {
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, email: true },
      },
    },
  },
  entrenador: {
    include: {
      estado: true,
      especialidades: { include: { especialidad: true } },
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, email: true },
      },
    },
  },
  solicitud: { include: { estado: true } },
  pago: { include: { estado: true } },
};

export async function createTurn(auth, body) {
  if (!auth.clientId) throw new ApiError(403, "Se requiere un perfil Cliente.");
  const requestId = Number(body.requestId ?? body.idSolicitud);
  const connection = await prisma.solicitudConexion.findUnique({
    where: { idSolicitud: requestId },
    include: {
      estado: true,
      entrenador: { include: { estado: true, usuario: { include: { estadoCuenta: true } } } },
    },
  });
  if (!connection || connection.idCliente !== auth.clientId) {
    throw new ApiError(404, "Solicitud de conexión no encontrada.");
  }
  if (connection.estado.nombre !== "Aceptada") {
    throw new ApiError(409, "La solicitud de conexión debe estar aceptada.");
  }
  if (
    connection.entrenador.estado.nombre !== "Aprobado" ||
    connection.entrenador.usuario.estadoCuenta.nombre !== "Activo"
  ) {
    throw new ApiError(409, "El entrenador ya no está habilitado.");
  }

  const startDate = requiredDate(body.fechaInicio, "fechaInicio");
  const endDate = body.fechaFin
    ? requiredDate(body.fechaFin, "fechaFin")
    : startDate;
  if (endDate < startDate) {
    throw new ApiError(400, "fechaFin no puede ser anterior a fechaInicio.");
  }
  const requested = await prisma.estadoTurno.findUniqueOrThrow({
    where: { nombre: "Solicitado" },
  });
  return prisma.turno.create({
    data: {
      idCliente: auth.clientId,
      idEntrenador: connection.idEntrenador,
      idSolicitud: requestId,
      idEstadoTurno: requested.idEstadoTurno,
      tarifa: connection.entrenador.tarifaBase,
      fechaInicio: startDate,
      fechaFin: endDate,
      horaInicio: requiredString(body.horaInicio, "horaInicio"),
      horaFin: requiredString(body.horaFin, "horaFin"),
      modalidad: requiredString(body.modalidad, "modalidad"),
      observaciones: optionalString(body.observaciones),
    },
    include,
  });
}

export function listMyTurns(clientId) {
  if (!clientId) return [];
  return prisma.turno.findMany({
    where: { idCliente: clientId },
    include,
    orderBy: [{ fechaInicio: "desc" }, { horaInicio: "desc" }],
  });
}

export function listReceivedTurns(trainerId) {
  return prisma.turno.findMany({
    where: { idEntrenador: trainerId },
    include,
    orderBy: [{ fechaInicio: "desc" }, { horaInicio: "desc" }],
  });
}

async function trainerResponse(id, accepted, auth, ip, reason) {
  const turn = await prisma.turno.findUnique({
    where: { idTurno: id },
    include,
  });
  if (!turn) throw new ApiError(404, "Turno no encontrado.");
  if (turn.idEntrenador !== auth.trainerId) {
    throw new ApiError(403, "El turno pertenece a otro entrenador.");
  }
  if (turn.estado.nombre !== "Solicitado") {
    throw new ApiError(409, "El turno ya fue respondido.");
  }
  const stateName = accepted ? "Reservado" : "Cancelado";
  const state = await prisma.estadoTurno.findUniqueOrThrow({
    where: { nombre: stateName },
  });
  const updated = await prisma.turno.update({
    where: { idTurno: id },
    data: {
      idEstadoTurno: state.idEstadoTurno,
      fechaConfirmacion: accepted ? new Date() : null,
      motivoCancelacion: accepted
        ? null
        : optionalString(reason) ?? "Rechazado por el entrenador.",
    },
    include,
  });
  await audit({
    userId: auth.userId,
    action: accepted ? "ACEPTAR_TURNO" : "RECHAZAR_TURNO",
    table: "turno",
    ip,
    detail: { turnId: id, reason: optionalString(reason) },
  });
  if (accepted) {
    await sendEmail({
      to: turn.cliente.usuario.email,
      subject: "Turno confirmado - FitConnection",
      text: `Tu turno con ${turn.entrenador.usuario.nombre} fue confirmado para ${turn.fechaInicio.toISOString().slice(0, 10)} a las ${turn.horaInicio}.`,
    });
  }
  return updated;
}

export const acceptTurn = (id, auth, ip) =>
  trainerResponse(id, true, auth, ip);
export const rejectTurn = (id, auth, ip, reason) =>
  trainerResponse(id, false, auth, ip, reason);

export async function cancelTurn(id, auth, ip, reason) {
  const turn = await prisma.turno.findUnique({ where: { idTurno: id }, include });
  if (!turn) throw new ApiError(404, "Turno no encontrado.");
  const isParticipant =
    turn.cliente.idUsuario === auth.userId ||
    turn.entrenador.idUsuario === auth.userId;
  if (!isParticipant && !auth.roles.includes("Administrador")) {
    throw new ApiError(403, "No podés cancelar este turno.");
  }
  if (!["Solicitado", "Reservado"].includes(turn.estado.nombre)) {
    throw new ApiError(409, "El turno no se puede cancelar en su estado actual.");
  }
  if (turn.pago?.estado.nombre === "Aprobado") {
    throw new ApiError(409, "Un turno pagado debe reembolsarse antes de cancelarlo.");
  }
  const cancelled = await prisma.estadoTurno.findUniqueOrThrow({
    where: { nombre: "Cancelado" },
  });
  const updated = await prisma.turno.update({
    where: { idTurno: id },
    data: {
      idEstadoTurno: cancelled.idEstadoTurno,
      motivoCancelacion: optionalString(reason) ?? "Cancelado por un participante.",
    },
    include,
  });
  await audit({
    userId: auth.userId,
    action: "CANCELAR_TURNO",
    table: "turno",
    ip,
    detail: { turnId: id, reason: optionalString(reason) },
  });
  return updated;
}

export async function finishTurn(id, auth, ip) {
  const turn = await prisma.turno.findUnique({ where: { idTurno: id }, include });
  if (!turn) throw new ApiError(404, "Turno no encontrado.");
  if (turn.idEntrenador !== auth.trainerId) {
    throw new ApiError(403, "El turno pertenece a otro entrenador.");
  }
  if (turn.estado.nombre !== "Reservado") {
    throw new ApiError(409, "Solo un turno reservado puede finalizarse.");
  }
  if (turn.pago?.estado.nombre !== "Aprobado") {
    throw new ApiError(409, "El turno debe tener un pago aprobado.");
  }
  const finished = await prisma.estadoTurno.findUniqueOrThrow({
    where: { nombre: "Finalizado" },
  });
  const updated = await prisma.turno.update({
    where: { idTurno: id },
    data: { idEstadoTurno: finished.idEstadoTurno },
    include,
  });
  await audit({
    userId: auth.userId,
    action: "FINALIZAR_TURNO",
    table: "turno",
    ip,
    detail: { turnId: id },
  });
  return updated;
}
