import { prisma } from "../lib/prisma.js";

export async function audit({
  userId = null,
  action,
  table,
  ip = null,
  detail = null,
}) {
  return prisma.auditoria.create({
    data: {
      idUsuario: userId,
      accion: action,
      tablaAfectada: table,
      ip,
      detalle:
        detail == null
          ? null
          : typeof detail === "string"
            ? detail
            : JSON.stringify(detail),
    },
  });
}
