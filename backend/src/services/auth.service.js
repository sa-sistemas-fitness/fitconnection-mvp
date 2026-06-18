import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";
import { prisma } from "../lib/prisma.js";
import { toPublicUser, userInclude } from "../utils/user-response.js";
import { audit } from "./audit.service.js";
import { sendEmail } from "./email.service.js";

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
  const nombre = String(body.nombre ?? "").trim();
  const apellido = String(body.apellido ?? "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");

  if (!nombre || !apellido || !email || !password) {
    throw new ApiError(
      400,
      "Nombre, apellido, email y contraseña son obligatorios.",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "El email no es válido.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "La contraseña debe tener al menos 6 caracteres.");
  }
  const birthDate = body.fechaNacimiento
    ? new Date(body.fechaNacimiento)
    : null;
  if (birthDate && Number.isNaN(birthDate.getTime())) {
    throw new ApiError(400, "fechaNacimiento no es válida.");
  }
  if (await prisma.usuario.findUnique({ where: { email } })) {
    throw new ApiError(409, "El email ya está registrado.");
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
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await prisma.tokenRecuperacion.updateMany({
      where: { idUsuario: user.idUsuario, usado: false },
      data: { usado: true },
    });
    await prisma.tokenRecuperacion.create({
      data: {
        idUsuario: user.idUsuario,
        token: tokenHash,
        fechaExpiracion: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendEmail({
      to: user.email,
      subject: "Recuperación de contraseña - FitConnection",
      text: `Usá este token durante la próxima hora: ${rawToken}`,
    });
  }

  return {
    message:
      "Si el email existe, enviamos instrucciones para recuperar la contraseña.",
  };
}

export async function resetPassword(body, ip) {
  const rawToken = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (!rawToken || password.length < 6) {
    throw new ApiError(400, "Token y contraseña de al menos 6 caracteres requeridos.");
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const recovery = await prisma.tokenRecuperacion.findUnique({
    where: { token: tokenHash },
  });
  if (
    !recovery ||
    recovery.usado ||
    recovery.fechaExpiracion.getTime() < Date.now()
  ) {
    throw new ApiError(400, "El token es inválido o venció.");
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { idUsuario: recovery.idUsuario },
      data: { contrasena: await bcrypt.hash(password, 12) },
    }),
    prisma.tokenRecuperacion.update({
      where: { idToken: recovery.idToken },
      data: { usado: true },
    }),
  ]);
  await audit({
    userId: recovery.idUsuario,
    action: "RESTABLECER_CONTRASENA",
    table: "usuario",
    ip,
  });
  return { message: "Contraseña actualizada correctamente." };
}
