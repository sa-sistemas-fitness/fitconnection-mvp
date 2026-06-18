import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const smtp = getTransporter();

  if (!smtp) {
    console.log("[EMAIL SIMULADO]", {
      from: env.smtp.from,
      to,
      subject,
      text,
    });
    return { simulated: true };
  }

  await smtp.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
  return { simulated: false };
}
