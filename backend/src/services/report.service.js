import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";

export async function adminOverview() {
  const [
    users,
    activeUsers,
    clients,
    approvedTrainers,
    pendingTrainers,
    pendingCertifications,
    connections,
    reservedTurns,
    completedTurns,
    totalPayments,
    approvedPayments,
    pendingModerations,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { estadoCuenta: { nombre: "Activo" } } }),
    prisma.cliente.count(),
    prisma.entrenador.count({ where: { estado: { nombre: "Aprobado" } } }),
    prisma.entrenador.count({ where: { estado: { nombre: "Pendiente" } } }),
    prisma.certificacion.count({ where: { estado: { nombre: "Pendiente" } } }),
    prisma.solicitudConexion.count(),
    prisma.turno.count({ where: { estado: { nombre: "Reservado" } } }),
    prisma.turno.count({ where: { estado: { nombre: "Finalizado" } } }),
    prisma.pago.count(),
    prisma.pago.aggregate({
      where: { estado: { nombre: "Aprobado" } },
      _sum: { monto: true, comision: true },
      _count: true,
    }),
    prisma.calificacion.count({
      where: { estadoModeracion: "Pendiente" },
    }),
  ]);

  return {
    users: { total: users, active: activeUsers },
    clients,
    trainers: { approved: approvedTrainers, pending: pendingTrainers },
    certifications: { pending: pendingCertifications },
    connections,
    turns: { reserved: reservedTurns, completed: completedTurns },
    payments: {
      total: totalPayments,
      approved: approvedPayments._count,
      volume: approvedPayments._sum.monto ?? 0,
      commissions: approvedPayments._sum.comision ?? 0,
    },
    moderations: { pending: pendingModerations },
  };
}

export async function connectionReport() {
  const groups = await prisma.solicitudConexion.groupBy({
    by: ["idEstadoSolicitud"],
    _count: true,
  });
  const states = await prisma.estadoSolicitudConexion.findMany();
  const names = Object.fromEntries(
    states.map((state) => [state.idEstadoSolicitud, state.nombre]),
  );
  const recent = await prisma.solicitudConexion.findMany({
    take: 20,
    orderBy: { fechaSolicitud: "desc" },
    include: {
      estado: true,
      cliente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
      entrenador: {
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          especialidades: { include: { especialidad: true } },
        },
      },
    },
  });
  return {
    byStatus: groups.map((group) => ({
      status: names[group.idEstadoSolicitud],
      count: group._count,
    })),
    recent,
  };
}

export async function financialReport() {
  const payments = await prisma.pago.findMany({
    include: {
      estado: true,
      entrenador: {
        include: {
          usuario: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: { idPago: "desc" },
  });
  const approved = payments.filter((payment) => payment.estado.nombre === "Aprobado");
  const refunded = payments.filter(
    (payment) => payment.estado.nombre === "Reembolsado",
  );
  return {
    totals: {
      approvedPayments: approved.length,
      grossVolume: approved.reduce((sum, payment) => sum + payment.monto, 0),
      discounts: approved.reduce((sum, payment) => sum + payment.descuento, 0),
      commissions: approved.reduce((sum, payment) => sum + payment.comision, 0),
      refundedPayments: refunded.length,
      refundedVolume: refunded.reduce((sum, payment) => sum + payment.monto, 0),
    },
    payments,
  };
}

export function trainerReport() {
  return prisma.entrenador.findMany({
    include: {
      estado: true,
      usuario: {
        select: { idUsuario: true, nombre: true, apellido: true, email: true },
      },
      especialidades: { include: { especialidad: true } },
      _count: {
        select: {
          solicitudes: true,
          turnos: true,
          pagos: true,
          calificaciones: true,
        },
      },
      pagos: {
        where: { estado: { nombre: "Aprobado" } },
        select: { monto: true, comision: true },
      },
    },
    orderBy: { calificacionPromedio: "desc" },
  });
}

export async function myTrainerReport(trainerId) {
  if (!trainerId) throw new ApiError(403, "Se requiere perfil de entrenador.");
  const trainer = await prisma.entrenador.findUnique({
    where: { idEntrenador: trainerId },
    include: {
      estado: true,
      usuario: { select: { nombre: true, apellido: true, email: true } },
      _count: {
        select: {
          solicitudes: true,
          turnos: true,
          pagos: true,
          calificaciones: true,
        },
      },
    },
  });
  if (!trainer) throw new ApiError(404, "Entrenador no encontrado.");
  const [turnsByStatus, payments] = await Promise.all([
    prisma.turno.groupBy({
      by: ["idEstadoTurno"],
      where: { idEntrenador: trainerId },
      _count: true,
    }),
    prisma.pago.aggregate({
      where: { idEntrenador: trainerId, estado: { nombre: "Aprobado" } },
      _sum: { monto: true, comision: true },
      _count: true,
    }),
  ]);
  const states = await prisma.estadoTurno.findMany();
  const stateNames = Object.fromEntries(
    states.map((state) => [state.idEstadoTurno, state.nombre]),
  );
  return {
    trainer,
    turnsByStatus: turnsByStatus.map((group) => ({
      status: stateNames[group.idEstadoTurno],
      count: group._count,
    })),
    financial: {
      approvedPayments: payments._count,
      grossVolume: payments._sum.monto ?? 0,
      platformCommissions: payments._sum.comision ?? 0,
      trainerNet:
        (payments._sum.monto ?? 0) - (payments._sum.comision ?? 0),
    },
  };
}
