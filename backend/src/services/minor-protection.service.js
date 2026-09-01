import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { isMinor } from "../utils/age.js";

export async function userIsMinor(userId, tx = prisma) {
  const user = await tx.usuario.findUnique({
    where: { idUsuario: userId },
    select: { fechaNacimiento: true },
  });
  if (!user) throw new ApiError(404, "Usuario no encontrado.");
  return isMinor(user.fechaNacimiento);
}

export async function assertTrainerAllowedForUser(userId, trainer, tx = prisma) {
  if (!(await userIsMinor(userId, tx))) return;
  const validCertification = trainer.trabajaConMenores && await tx.certificacion.count({
    where: {
      idEntrenador: trainer.idEntrenador,
      habilitaMenores: true,
      estado: { nombre: "Validado" },
      OR: [{ fechaVencimiento: null }, { fechaVencimiento: { gte: new Date() } }],
    },
  });
  if (!validCertification) throw new ApiError(404, "Entrenador habilitado no encontrado.");
}

export const validMinorCertificationFilter = () => ({
  trabajaConMenores: true,
  certificaciones: {
    some: {
      habilitaMenores: true,
      estado: { nombre: "Validado" },
      OR: [{ fechaVencimiento: null }, { fechaVencimiento: { gte: new Date() } }],
    },
  },
});

export function hasValidMinorCertification(trainer, now = new Date()) {
  return Boolean(trainer.trabajaConMenores && trainer.certificaciones?.some((certificate) =>
    certificate.habilitaMenores &&
    certificate.estado.nombre === "Validado" &&
    (!certificate.fechaVencimiento || new Date(certificate.fechaVencimiento) >= now)
  ));
}
