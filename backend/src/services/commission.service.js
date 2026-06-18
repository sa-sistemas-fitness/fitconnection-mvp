import { prisma } from "../lib/prisma.js";

export function commissionRateForAverage(average, reviewCount) {
  if (!reviewCount) return 15;
  if (average >= 4.5) return 8;
  if (average >= 4.0) return 12;
  if (average >= 3.5) return 16;
  if (average >= 3.0) return 20;
  return 25;
}

export async function recalculateTrainerRating(trainerId, tx = prisma) {
  const aggregate = await tx.calificacion.aggregate({
    where: {
      idEntrenador: trainerId,
      estadoModeracion: { not: "Oculta" },
    },
    _avg: { puntuacion: true },
    _count: { puntuacion: true },
  });

  const reviewCount = aggregate._count.puntuacion;
  const average = reviewCount ? aggregate._avg.puntuacion : 0;
  const commissionRate = commissionRateForAverage(average, reviewCount);

  return tx.entrenador.update({
    where: { idEntrenador: trainerId },
    data: {
      calificacionPromedio: Number(average.toFixed(2)),
      porcentajeComision: commissionRate,
    },
  });
}
