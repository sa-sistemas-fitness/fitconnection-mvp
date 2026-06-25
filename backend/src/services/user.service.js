import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { toPublicUser, userInclude } from "../utils/user-response.js";
import { audit } from "./audit.service.js";

export async function listUsers() {
  const users = await prisma.usuario.findMany({
    include: userInclude,
    orderBy: { fechaRegistro: "desc" },
  });
  const blockedIdentities = await prisma.identidadBloqueada.findMany({
    where: { activa: true },
    select: { dniHash: true, motivo: true, fechaBloqueo: true },
  });
  const blockedByDni = new Map(
    blockedIdentities.map((identity) => [identity.dniHash, identity]),
  );
  return users.map((user) => {
    const blockedIdentity = blockedByDni.get(user.dniHash);
    return {
      ...toPublicUser(user),
      dniBloqueado: Boolean(blockedIdentity),
      motivoBloqueoDni: blockedIdentity?.motivo ?? null,
      fechaBloqueoDni: blockedIdentity?.fechaBloqueo ?? null,
    };
  });
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

async function findStatusId(nombre) {
  const status = await prisma.estadoCuenta.findUnique({
    where: { nombre },
  });
  if (!status) throw new ApiError(400, "Estado de cuenta inválido.");
  return status.idEstadoCuenta;
}

async function getAdminTarget(id, actor) {
  const user = await prisma.usuario.findUnique({
    where: { idUsuario: id },
    include: userInclude,
  });
  if (!user) throw new ApiError(404, "Usuario no encontrado.");
  if (id === actor.userId) {
    throw new ApiError(400, "No podés bloquear o desbloquear tu propia cuenta administrativa.");
  }
  return user;
}

function cleanReason(reason) {
  const cleaned = String(reason ?? "").trim();
  if (cleaned.length < 4) {
    throw new ApiError(400, "El motivo de bloqueo debe tener al menos 4 caracteres.");
  }
  return cleaned.slice(0, 280);
}

async function upsertActiveDniBlock(user, actor, reason) {
  const activeBlock = await prisma.identidadBloqueada.findFirst({
    where: { dniHash: user.dniHash, activa: true },
  });
  if (activeBlock) {
    return prisma.identidadBloqueada.update({
      where: { idIdentidadBloqueada: activeBlock.idIdentidadBloqueada },
      data: { motivo: reason, idAdmin: actor.userId },
    });
  }
  return prisma.identidadBloqueada.create({
    data: {
      dniHash: user.dniHash,
      dniMascara: user.dniMascara,
      motivo: reason,
      idAdmin: actor.userId,
    },
  });
}

export async function updateUserAccess(id, action, actor, reasonValue) {
  const user = await getAdminTarget(id, actor);
  const actionName = String(action ?? "").trim();
  const reason =
    ["block-account", "block-account-dni"].includes(actionName)
      ? cleanReason(reasonValue)
      : String(reasonValue ?? "").trim().slice(0, 280);

  if (actionName === "block-account") {
    const blockedStatusId = await findStatusId("Bloqueado");
    const updatedUser = await prisma.usuario.update({
      where: { idUsuario: id },
      data: { idEstadoCuenta: blockedStatusId },
      include: userInclude,
    });
    await audit({
      userId: actor.userId,
      action: "BLOQUEO_CUENTA",
      table: "usuario",
      ip: actor.ip,
      detail: { targetUserId: id, reason },
    });
    return {
      user: toPublicUser(updatedUser),
      message: "Cuenta bloqueada correctamente.",
    };
  }

  if (actionName === "block-account-dni") {
    const blockedStatusId = await findStatusId("Bloqueado");
    const updatedUser = await prisma.usuario.update({
      where: { idUsuario: id },
      data: { idEstadoCuenta: blockedStatusId },
      include: userInclude,
    });
    await upsertActiveDniBlock(user, actor, reason);
    await audit({
      userId: actor.userId,
      action: "BLOQUEO_CUENTA_DNI",
      table: "identidad_bloqueada",
      ip: actor.ip,
      detail: {
        targetUserId: id,
        dniMascara: user.dniMascara,
        reason,
      },
    });
    return {
      user: toPublicUser(updatedUser),
      message: "Cuenta y DNI bloqueados correctamente.",
    };
  }

  if (actionName === "unblock-account") {
    const activeStatusId = await findStatusId("Activo");
    const updatedUser = await prisma.usuario.update({
      where: { idUsuario: id },
      data: { idEstadoCuenta: activeStatusId },
      include: userInclude,
    });
    await audit({
      userId: actor.userId,
      action: "DESBLOQUEO_CUENTA",
      table: "usuario",
      ip: actor.ip,
      detail: { targetUserId: id, reason },
    });
    return {
      user: toPublicUser(updatedUser),
      message: "Cuenta desbloqueada correctamente.",
    };
  }

  if (actionName === "unblock-dni") {
    await prisma.identidadBloqueada.updateMany({
      where: { dniHash: user.dniHash, activa: true },
      data: { activa: false, fechaDesbloqueo: new Date() },
    });
    await audit({
      userId: actor.userId,
      action: "DESBLOQUEO_DNI",
      table: "identidad_bloqueada",
      ip: actor.ip,
      detail: {
        targetUserId: id,
        dniMascara: user.dniMascara,
        reason,
      },
    });
    return {
      user: toPublicUser(user),
      message: "DNI desbloqueado correctamente.",
    };
  }

  throw new ApiError(400, "Acción administrativa inválida.");
}
