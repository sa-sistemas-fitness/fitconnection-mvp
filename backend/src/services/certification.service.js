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
  entrenador: {
    include: {
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, email: true },
      },
    },
  },
};

export async function createCertification(userId, body) {
  const trainer = await prisma.entrenador.findUnique({ where: { idUsuario: userId } });
  if (!trainer) {
    throw new ApiError(403, "Primero debés crear una postulación de entrenador.");
  }
  const pending = await prisma.estadoCertificacion.findUniqueOrThrow({
    where: { nombre: "Pendiente" },
  });
  return prisma.certificacion.create({
    data: {
      idEntrenador: trainer.idEntrenador,
      idEstadoCertificacion: pending.idEstadoCertificacion,
      titulo: requiredString(body.titulo, "titulo"),
      entidadEmisora: requiredString(body.entidadEmisora, "entidadEmisora"),
      fechaEmision: requiredDate(body.fechaEmision, "fechaEmision"),
      fechaVencimiento: body.fechaVencimiento
        ? requiredDate(body.fechaVencimiento, "fechaVencimiento")
        : null,
      archivo: optionalString(body.archivo),
    },
    include,
  });
}

export async function listMyCertifications(userId) {
  const trainer = await prisma.entrenador.findUnique({ where: { idUsuario: userId } });
  if (!trainer) return [];
  const certifications = await prisma.certificacion.findMany({
    where: { idEntrenador: trainer.idEntrenador },
    include,
    orderBy: { fechaEmision: "desc" },
  });
  const now = new Date();
  return certifications.map((certification) =>
    certification.fechaVencimiento &&
    certification.fechaVencimiento < now &&
    !["Rechazado", "Expirado"].includes(certification.estado.nombre)
      ? { ...certification, estado: { ...certification.estado, nombre: "Expirado" } }
      : certification,
  );
}

export function listPendingCertifications() {
  return prisma.certificacion.findMany({
    where: { estado: { nombre: "Pendiente" } },
    include,
    orderBy: { idCertificacion: "asc" },
  });
}

async function reviewCertification(id, approved, actor, comment) {
  const certification = await prisma.certificacion.findUnique({
    where: { idCertificacion: id },
    include,
  });
  if (!certification) throw new ApiError(404, "Certificación no encontrada.");
  if (certification.estado.nombre !== "Pendiente") {
    throw new ApiError(409, "La certificación ya fue revisada.");
  }

  const stateName = approved ? "Validado" : "Rechazado";
  const state = await prisma.estadoCertificacion.findUniqueOrThrow({
    where: { nombre: stateName },
  });
  const updated = await prisma.certificacion.update({
    where: { idCertificacion: id },
    data: {
      idEstadoCertificacion: state.idEstadoCertificacion,
      comentarioAdmin: optionalString(comment),
      fechaRevision: new Date(),
    },
    include,
  });

  await audit({
    userId: actor.userId,
    action: approved ? "APROBAR_CERTIFICACION" : "RECHAZAR_CERTIFICACION",
    table: "certificacion",
    ip: actor.ip,
    detail: { certificationId: id, comment: optionalString(comment) },
  });
  await sendEmail({
    to: certification.entrenador.usuario.email,
    subject: `Certificación ${approved ? "aprobada" : "rechazada"} - FitConnection`,
    text: `Tu certificación "${certification.titulo}" fue ${stateName.toLowerCase()}.${comment ? ` Comentario: ${comment}` : ""}`,
  });
  return updated;
}

export const approveCertification = (id, actor, comment) =>
  reviewCertification(id, true, actor, comment);
export const rejectCertification = (id, actor, comment) =>
  reviewCertification(id, false, actor, comment);
