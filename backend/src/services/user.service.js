import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { toPublicUser, userInclude } from "../utils/user-response.js";
import { audit } from "./audit.service.js";

export async function listUsers() {
  const users = await prisma.usuario.findMany({
    include: userInclude,
    orderBy: { fechaRegistro: "desc" },
  });
  return users.map(toPublicUser);
}

export async function getUser(id) {
  const user = await prisma.usuario.findUnique({
    where: { idUsuario: id },
    include: userInclude,
  });
  if (!user) throw new ApiError(404, "Usuario no encontrado.");
  return toPublicUser(user);
}

export async function changeUserStatus(id, statusName, actor) {
  const status = await prisma.estadoCuenta.findUnique({
    where: { nombre: String(statusName ?? "").trim() },
  });
  if (!status) throw new ApiError(400, "Estado de cuenta inválido.");
  if (id === actor.userId && status.nombre !== "Activo") {
    throw new ApiError(400, "No podés desactivar tu propia cuenta administrativa.");
  }

  const user = await prisma.usuario.update({
    where: { idUsuario: id },
    data: { idEstadoCuenta: status.idEstadoCuenta },
    include: userInclude,
  });
  await audit({
    userId: actor.userId,
    action: "CAMBIO_ESTADO_USUARIO",
    table: "usuario",
    ip: actor.ip,
    detail: { targetUserId: id, status: status.nombre },
  });
  return toPublicUser(user);
}
