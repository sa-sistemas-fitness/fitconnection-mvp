import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { optionalString, requiredNumber } from "../utils/request.js";
import { audit } from "./audit.service.js";
import { recalculateTrainerRating } from "./commission.service.js";

const include = {
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
  pago: { include: { estado: true, turno: { include: { estado: true } } } },
};

export async function createReview(auth, body, ip) {
  if (!auth.clientId) throw new ApiError(403, "Se requiere un perfil Cliente.");
  const paymentId = Number(body.paymentId ?? body.idPago);
  const score = requiredNumber(body.puntuacion, "puntuacion", { min: 1 });
  if (!Number.isInteger(score) || score > 5) {
    throw new ApiError(400, "La puntuación debe ser un entero entre 1 y 5.");
  }
  const payment = await prisma.pago.findUnique({
    where: { idPago: paymentId },
    include: { estado: true, calificacion: true },
  });
  if (!payment || payment.idCliente !== auth.clientId) {
    throw new ApiError(404, "Pago no encontrado.");
  }
  if (payment.estado.nombre !== "Aprobado") {
    throw new ApiError(409, "Solo un pago aprobado permite calificar.");
  }
  if (payment.calificacion) {
    throw new ApiError(409, "Este pago ya fue calificado.");
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.calificacion.create({
      data: {
        idPago: payment.idPago,
        idCliente: payment.idCliente,
        idEntrenador: payment.idEntrenador,
        puntuacion: score,
        comentario: optionalString(body.comentario),
        estadoModeracion: "Pendiente",
      },
      include,
    });
    await recalculateTrainerRating(payment.idEntrenador, tx);
    return created;
  });
  await audit({
    userId: auth.userId,
    action: "CREAR_CALIFICACION",
    table: "calificacion",
    ip,
    detail: { reviewId: review.idCalificacion, paymentId, score },
  });
  return review;
}

export function listTrainerReviews(trainerId) {
  return prisma.calificacion.findMany({
    where: {
      idEntrenador: trainerId,
      estadoModeracion: { not: "Oculta" },
    },
    include,
    orderBy: { fecha: "desc" },
  });
}

export function listPendingModeration() {
  return prisma.calificacion.findMany({
    where: { estadoModeracion: "Pendiente" },
    include,
    orderBy: { fecha: "asc" },
  });
}

export async function moderateReview(id, status, actor, comment) {
  const normalizedStatus = String(status ?? "").trim();
  if (!["Visible", "Oculta"].includes(normalizedStatus)) {
    throw new ApiError(400, "La moderación debe ser Visible u Oculta.");
  }
  const review = await prisma.calificacion.findUnique({
    where: { idCalificacion: id },
  });
  if (!review) throw new ApiError(404, "Calificación no encontrada.");

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.calificacion.update({
      where: { idCalificacion: id },
      data: {
        estadoModeracion: normalizedStatus,
        comentario:
          comment && normalizedStatus === "Oculta"
            ? `${review.comentario ?? ""}\n[Moderación: ${comment}]`.trim()
            : review.comentario,
      },
      include,
    });
    await recalculateTrainerRating(review.idEntrenador, tx);
    return result;
  });
  await audit({
    userId: actor.userId,
    action: "MODERAR_CALIFICACION",
    table: "calificacion",
    ip: actor.ip,
    detail: { reviewId: id, status: normalizedStatus, comment: optionalString(comment) },
  });
  return updated;
}
