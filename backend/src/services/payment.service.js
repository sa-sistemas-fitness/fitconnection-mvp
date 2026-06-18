import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { optionalString, requiredNumber, requiredString } from "../utils/request.js";
import { audit } from "./audit.service.js";
import { sendEmail } from "./email.service.js";

const include = {
  estado: true,
  turno: { include: { estado: true } },
  cliente: {
    include: {
      usuario: { select: { idUsuario: true, nombre: true, apellido: true, email: true } },
    },
  },
  entrenador: {
    include: {
      usuario: { select: { idUsuario: true, nombre: true, apellido: true, email: true } },
    },
  },
  calificacion: true,
};

export async function createPayment(auth, body, ip) {
  if (!auth.clientId) throw new ApiError(403, "Se requiere un perfil Cliente.");
  const turnId = Number(body.turnId ?? body.idTurno);
  const turn = await prisma.turno.findUnique({
    where: { idTurno: turnId },
    include: {
      estado: true,
      entrenador: { include: { usuario: true } },
      cliente: { include: { usuario: true } },
      pago: { include: { estado: true, calificacion: true } },
    },
  });
  if (!turn || turn.idCliente !== auth.clientId) {
    throw new ApiError(404, "Turno no encontrado.");
  }
  if (turn.estado.nombre !== "Reservado") {
    throw new ApiError(409, "Solo un turno reservado puede pagarse.");
  }
  if (
    turn.pago &&
    turn.pago.estado.nombre !== "Rechazado"
  ) {
    throw new ApiError(409, "El turno ya tiene un pago vigente.");
  }
  if (turn.pago?.calificacion) {
    throw new ApiError(409, "El pago ya tiene una calificación asociada.");
  }

  const discount =
    body.descuento == null
      ? 0
      : requiredNumber(body.descuento, "descuento", { min: 0 });
  if (discount > turn.tarifa) {
    throw new ApiError(400, "El descuento no puede superar la tarifa.");
  }
  const simulatedResult = String(body.resultado ?? "Aprobado").trim();
  if (!["Aprobado", "Rechazado"].includes(simulatedResult)) {
    throw new ApiError(
      400,
      "El resultado simulado debe ser Aprobado o Rechazado.",
    );
  }
  const paymentState = await prisma.estadoPago.findUniqueOrThrow({
    where: { nombre: simulatedResult },
  });
  const amount = turn.tarifa - discount;
  const commission = Number(
    ((amount * turn.entrenador.porcentajeComision) / 100).toFixed(2),
  );
  const paymentData = {
    idEstadoPago: paymentState.idEstadoPago,
    monto: amount,
    descuento: discount,
    comision: commission,
    metodoPago: requiredString(body.metodoPago, "metodoPago"),
    fechaPago: new Date(),
  };
  const payment = turn.pago
    ? await prisma.pago.update({
        where: { idPago: turn.pago.idPago },
        data: paymentData,
        include,
      })
    : await prisma.pago.create({
        data: {
          idTurno: turn.idTurno,
          idCliente: turn.idCliente,
          idEntrenador: turn.idEntrenador,
          ...paymentData,
        },
        include,
      });
  await audit({
    userId: auth.userId,
    action: "CAMBIO_ESTADO_PAGO",
    table: "pago",
    ip,
    detail: {
      paymentId: payment.idPago,
      status: simulatedResult,
      simulated: true,
      retry: Boolean(turn.pago),
    },
  });
  if (simulatedResult === "Aprobado") {
    await sendEmail({
      to: turn.cliente.usuario.email,
      subject: "Pago aprobado - FitConnection",
      text: `Tu pago simulado por $${amount.toFixed(2)} fue aprobado.`,
    });
  }
  return payment;
}

export function listMyPayments(clientId) {
  if (!clientId) return [];
  return prisma.pago.findMany({
    where: { idCliente: clientId },
    include,
    orderBy: { idPago: "desc" },
  });
}
export function listReceivedPayments(trainerId) {
  return prisma.pago.findMany({
    where: { idEntrenador: trainerId },
    include,
    orderBy: { idPago: "desc" },
  });
}
export function listAllPayments() {
  return prisma.pago.findMany({ include, orderBy: { idPago: "desc" } });
}

export async function changePaymentStatus(id, statusName, actor, comment) {
  const allowed = ["Pendiente", "Aprobado", "Rechazado", "Reembolsado"];
  if (!allowed.includes(statusName)) {
    throw new ApiError(400, "Estado de pago inválido.");
  }
  const payment = await prisma.pago.findUnique({ where: { idPago: id }, include });
  if (!payment) throw new ApiError(404, "Pago no encontrado.");
  const state = await prisma.estadoPago.findUniqueOrThrow({
    where: { nombre: statusName },
  });
  const updated = await prisma.pago.update({
    where: { idPago: id },
    data: {
      idEstadoPago: state.idEstadoPago,
      fechaPago: statusName === "Aprobado" ? new Date() : payment.fechaPago,
    },
    include,
  });
  await audit({
    userId: actor.userId,
    action: "CAMBIO_ESTADO_PAGO",
    table: "pago",
    ip: actor.ip,
    detail: { paymentId: id, status: statusName, comment: optionalString(comment) },
  });
  if (statusName === "Aprobado") {
    await sendEmail({
      to: payment.cliente.usuario.email,
      subject: "Pago aprobado - FitConnection",
      text: `Tu pago por $${payment.monto.toFixed(2)} fue aprobado.`,
    });
  }
  return updated;
}
