import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { optionalString, requiredString } from "../utils/request.js";
import { intervalsOverlap, validateTimeRange } from "../utils/schedule.js";
import { assertTrainerAllowedForUser } from "./minor-protection.service.js";

export async function listTrainerAvailability(trainerId, auth) {
  const trainer = await prisma.entrenador.findUnique({
    where: { idEntrenador: trainerId },
    include: { estado: true, usuario: { include: { estadoCuenta: true } } },
  });
  if (!trainer || trainer.estado.nombre !== "Aprobado" || trainer.usuario.estadoCuenta.nombre !== "Activo") {
    throw new ApiError(404, "Entrenador aprobado no encontrado.");
  }
  await assertTrainerAllowedForUser(auth.userId, trainer);
  const [slots, occupiedTurns] = await Promise.all([
    prisma.disponibilidadEntrenador.findMany({
      where: { idEntrenador: trainerId, activa: true },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    }),
    prisma.turno.findMany({
      where: {
        idEntrenador: trainerId,
        estado: { nombre: { in: ["Solicitado", "Reservado"] } },
        fechaInicio: { gte: new Date(new Date().toISOString().slice(0, 10)) },
      },
      select: { idTurno: true, fechaInicio: true, fechaFin: true, horaInicio: true, horaFin: true, modalidad: true },
      orderBy: [{ fechaInicio: "asc" }, { horaInicio: "asc" }],
    }),
  ]);
  return { slots, occupiedTurns };
}

export function listMyAvailability(trainerId) {
  return prisma.disponibilidadEntrenador.findMany({
    where: { idEntrenador: trainerId, activa: true },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });
}

export async function createAvailability(trainerId, body) {
  const diaSemana = Number(body.diaSemana);
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    throw new ApiError(400, "diaSemana debe estar entre 0 y 6.");
  }
  const { horaInicio, horaFin } = validateTimeRange(body.horaInicio, body.horaFin);
  const modalidad = requiredString(body.modalidad, "modalidad");
  const existing = await prisma.disponibilidadEntrenador.findMany({
    where: { idEntrenador: trainerId, diaSemana, activa: true },
  });
  if (existing.some((slot) => intervalsOverlap(horaInicio, horaFin, slot.horaInicio, slot.horaFin))) {
    throw new ApiError(409, "El bloque se superpone con otra disponibilidad.");
  }
  return prisma.disponibilidadEntrenador.create({
    data: {
      idEntrenador: trainerId,
      diaSemana,
      horaInicio,
      horaFin,
      modalidad,
      observaciones: optionalString(body.observaciones),
    },
  });
}

export async function deleteAvailability(trainerId, availabilityId) {
  const slot = await prisma.disponibilidadEntrenador.findUnique({
    where: { idDisponibilidad: availabilityId },
  });
  if (!slot) throw new ApiError(404, "Disponibilidad no encontrada.");
  if (slot.idEntrenador !== trainerId) throw new ApiError(403, "La disponibilidad pertenece a otro entrenador.");
  await prisma.disponibilidadEntrenador.delete({ where: { idDisponibilidad: availabilityId } });
}
