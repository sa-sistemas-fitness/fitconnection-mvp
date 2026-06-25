import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;

function isAuthError(error) {
  return (
    error?.code === "EAUTH" ||
    error?.responseCode === 534 ||
    error?.responseCode === 535 ||
    String(error?.message ?? "").toLowerCase().includes("auth")
  );
}

function isSmtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
  return transporter;
}

export async function verifySmtpTransport() {
  const smtp = getTransporter();

  if (!smtp) {
    console.info(
      "[SMTP] SMTP no configurado. Los emails se simularán en consola.",
    );
    return { configured: false, verified: false };
  }

  try {
    await smtp.verify();
    console.info(
      `[SMTP] SMTP configurado correctamente (${env.smtp.host}:${env.smtp.port}, secure=${env.smtp.secure}).`,
    );
    return { configured: true, verified: true };
  } catch (error) {
    if (isAuthError(error)) {
      console.error(
        "[SMTP] Error de autenticación SMTP. En Gmail usá una contraseña de aplicación, no la contraseña normal de la cuenta.",
      );
    } else {
      console.error(
        `[SMTP] Error verificando SMTP: ${error?.message ?? "error desconocido"}`,
      );
    }
    return { configured: true, verified: false, error };
  }
}

export async function sendEmail({ to, subject, text, html, recoveryLink }) {
  const smtp = getTransporter();

  if (!smtp) {
    console.info("[SMTP] SMTP no configurado. Email simulado.");
    if (recoveryLink) {
      console.info(`[SMTP] Enlace de recuperación: ${recoveryLink}`);
    } else {
      console.info("[EMAIL SIMULADO]", {
        from: env.smtp.from,
        to,
        subject,
        text,
      });
    }
    return { simulated: true };
  }

  try {
    const result = await smtp.sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
      html,
    });
    console.info(`[SMTP] Email enviado a ${to}. MessageId: ${result.messageId}`);
    return { simulated: false, messageId: result.messageId };
  } catch (error) {
    if (isAuthError(error)) {
      console.error(
        "[SMTP] Error de autenticación SMTP al enviar email. Revisá SMTP_USER y SMTP_PASS; Gmail requiere contraseña de aplicación.",
      );
    } else {
      console.error(
        `[SMTP] Error enviando email a ${to}: ${error?.message ?? "error desconocido"}`,
      );
    }
    throw error;
  }
}
