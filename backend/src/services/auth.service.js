import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { toPublicUser, userInclude } from "../utils/user-response.js";
import { audit } from "./audit.service.js";
import { sendEmail } from "./email.service.js";
import { getDniIdentity } from "../utils/dni.js";
import { parseDateOfBirth } from "../utils/age.js";
import { validPersonName } from "../utils/person-name.js";
import { createResetToken, hashResetToken, resetTokenIsUsable } from "../utils/password-reset-token.js";

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function createToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: String(userId),
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser(body, ip) {
  const nombre = validPersonName(body.nombre, "nombre");
  const apellido = validPersonName(body.apellido, "apellido");
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  const dni = getDniIdentity(body.dni);

  if (!email || !password) {
    throw new ApiError(
      400,
      "Nombre, apellido, email, DNI y contraseña son obligatorios.",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "El email no es válido.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "La contraseña debe tener al menos 6 caracteres.");
  }
  const birthDate = parseDateOfBirth(body.fechaNacimiento);
  if (await prisma.usuario.findUnique({ where: { email } })) {
    throw new ApiError(409, "El email ya está registrado.");
  }
  const blockedIdentity = await prisma.identidadBloqueada.findFirst({
    where: { dniHash: dni.hash, activa: true },
  });
  if (blockedIdentity) {
    throw new ApiError(
      403,
      "No es posible completar el registro. Contacta al soporte.",
    );
  }
  if (await prisma.usuario.findUnique({ where: { dniHash: dni.hash } })) {
    throw new ApiError(409, "El DNI ya está registrado.");
  }

  const [activeState, clientRole] = await Promise.all([
    prisma.estadoCuenta.findUnique({ where: { nombre: "Activo" } }),
    prisma.rol.findUnique({ where: { nombre: "Cliente" } }),
  ]);
  if (!activeState || !clientRole) {
    throw new ApiError(
      503,
      "La base no está inicializada. Ejecutá el seed primero.",
    );
  }

  const user = await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      email,
      contrasena: await bcrypt.hash(password, 12),
      dniHash: dni.hash,
      dniMascara: dni.mask,
      dniVerificado: false,
      telefono: body.telefono ? String(body.telefono).trim() : null,
      fechaNacimiento: birthDate,
      idEstadoCuenta: activeState.idEstadoCuenta,
      roles: { create: { idRol: clientRole.idRol } },
      cliente: {
        create: {
          objetivoFisico: body.objetivoFisico?.trim() || null,
          nivelDeportivo: body.nivelDeportivo?.trim() || null,
          modalidadPreferida: body.modalidadPreferida?.trim() || null,
          ubicacion: body.ubicacion?.trim() || null,
        },
      },
    },
    include: userInclude,
  });

  await audit({
    userId: user.idUsuario,
    action: "REGISTRO",
    table: "usuario",
    ip,
    detail: "Cuenta creada con rol Cliente.",
  });

  return { token: createToken(user.idUsuario), user: toPublicUser(user) };
}

export async function loginUser(body, ip) {
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: userInclude,
  });
  const validPassword = user && (await bcrypt.compare(password, user.contrasena));
  const successful =
    Boolean(validPassword) && user.estadoCuenta.nombre === "Activo";

  await prisma.loginAttempt.create({
    data: { email, ip, exitoso: successful },
  });
  await audit({
    userId: user?.idUsuario ?? null,
    action: successful ? "LOGIN_EXITOSO" : "LOGIN_FALLIDO",
    table: "usuario",
    ip,
    detail: { email },
  });

  if (!validPassword) throw new ApiError(401, "Credenciales incorrectas.");
  if (user.estadoCuenta.nombre !== "Activo") {
    throw new ApiError(
      403,
      `La cuenta se encuentra ${user.estadoCuenta.nombre.toLowerCase()}.`,
    );
  }

  const updatedUser = await prisma.usuario.update({
    where: { idUsuario: user.idUsuario },
    data: { ultimoLogin: new Date() },
    include: userInclude,
  });

  return {
    token: createToken(user.idUsuario),
    user: toPublicUser(updatedUser),
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.usuario.findUnique({
    where: { idUsuario: userId },
    include: userInclude,
  });
  if (!user) throw new ApiError(404, "Usuario no encontrado.");
  return { user: toPublicUser(user) };
}

export async function forgotPassword(body) {
  const email = normalizeEmail(body.email);
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (user) {
    const { rawToken, tokenHash, expiresAt } = createResetToken();
    await prisma.tokenRecuperacion.updateMany({
      where: { idUsuario: user.idUsuario, usado: false },
      data: { usado: true },
    });
    await prisma.tokenRecuperacion.create({
      data: {
        idUsuario: user.idUsuario,
        token: tokenHash,
        fechaExpiracion: expiresAt,
      },
    });
    const recoveryLink = `${env.frontendUrl.replace(/\/+$/, "")}/restablecer-contrasena?token=${rawToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Recuperación de contraseña - FitConnection",
        text: `Recuperá tu contraseña desde este enlace durante la próxima hora: ${recoveryLink}`,
        html: `<p>Recibimos una solicitud para recuperar tu contraseña.</p><p><a href="${recoveryLink}">Restablecer contraseña</a></p><p>El enlace vence en 1 hora.</p>`,
        recoveryLink,
      });
    } catch {
      console.error(
        "[AUTH] No se pudo enviar el email de recuperación. Se mantiene la respuesta genérica por seguridad.",
      );
    }
  }

  return {
    message:
      "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.",
  };
}

export async function resetPassword(body, ip) {
  const rawToken = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (!rawToken || password.length < 6) {
    throw new ApiError(400, "Token y contraseña de al menos 6 caracteres requeridos.");
  }

  const tokenHash = hashResetToken(rawToken);
  const passwordHash = await bcrypt.hash(password, 12);
  const recovery = await prisma.$transaction(async (tx) => {
    const token = await tx.tokenRecuperacion.findUnique({ where: { token: tokenHash } });
    if (!token || token.usado) throw new ApiError(400, "El token es inválido.");
    if (!resetTokenIsUsable(token)) {
      throw new ApiError(400, "El token expiró.");
    }
    const consumed = await tx.tokenRecuperacion.updateMany({
      where: {
        idToken: token.idToken,
        usado: false,
        fechaExpiracion: { gte: new Date() },
      },
      data: { usado: true },
    });
    if (consumed.count !== 1) throw new ApiError(400, "El token es inválido o expiró.");
    await tx.usuario.update({
      where: { idUsuario: token.idUsuario },
      data: { contrasena: passwordHash },
    });
    await tx.tokenRecuperacion.updateMany({
      where: { idUsuario: token.idUsuario, usado: false },
      data: { usado: true },
    });
    return token;
  });
  await audit({
    userId: recovery.idUsuario,
    action: "RESTABLECER_CONTRASENA",
    table: "usuario",
    ip,
  });
  return { message: "Contraseña actualizada correctamente." };
}

export async function changePassword(userId, body, ip) {
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (newPassword.length < 6) {
    throw new ApiError(400, "La nueva contraseña debe tener al menos 6 caracteres.");
  }

  const user = await prisma.usuario.findUnique({
    where: { idUsuario: userId },
  });

  if (!user) throw new ApiError(404, "Usuario no encontrado.");

  const validPassword = await bcrypt.compare(currentPassword, user.contrasena);
  if (!validPassword) {
    throw new ApiError(400, "La contraseña actual es incorrecta.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.usuario.update({
    where: { idUsuario: userId },
    data: { contrasena: passwordHash },
  });

  await audit({
    userId: user.idUsuario,
    action: "CAMBIO_CONTRASENA",
    table: "usuario",
    ip,
  });

  return { message: "Contraseña actualizada correctamente." };
}
