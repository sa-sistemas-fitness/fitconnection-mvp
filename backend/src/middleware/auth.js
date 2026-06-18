import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";

export async function authRequired(request, _response, next) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token de acceso requerido."));
  }

  let payload;
  try {
    payload = jwt.verify(authorization.slice(7), env.jwtSecret);
  } catch {
    return next(new ApiError(401, "Token inválido o vencido."));
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario: Number(payload.sub) },
      include: {
        estadoCuenta: true,
        roles: { include: { rol: true } },
        cliente: true,
        entrenador: { include: { estado: true } },
      },
    });

    if (!user) throw new ApiError(401, "Usuario no encontrado.");
    if (user.estadoCuenta.nombre !== "Activo") {
      throw new ApiError(403, "La cuenta no está activa.");
    }

    request.auth = {
      userId: user.idUsuario,
      roles: user.roles.map(({ rol }) => rol.nombre),
      clientId: user.cliente?.idCliente ?? null,
      trainerId: user.entrenador?.idEntrenador ?? null,
      trainerStatus: user.entrenador?.estado.nombre ?? null,
    };
    next();
  } catch (error) {
    return next(error);
  }
}

export const requireAuth = authRequired;

export function requireRole(...allowedRoles) {
  return (request, _response, next) => {
    if (!allowedRoles.some((role) => request.auth.roles.includes(role))) {
      return next(new ApiError(403, "No tenés permisos para esta acción."));
    }
    return next();
  };
}

export const requireAdmin = requireRole("Administrador");

export function requireTrainerApproved(request, _response, next) {
  if (
    !request.auth.roles.includes("Entrenador") ||
    request.auth.trainerStatus !== "Aprobado"
  ) {
    return next(
      new ApiError(403, "Se requiere un perfil de entrenador aprobado."),
    );
  }
  return next();
}
