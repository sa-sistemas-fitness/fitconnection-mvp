import crypto from "node:crypto";

import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";

export function normalizeDni(value) {
  return String(value ?? "").replace(/[.\-\s]/g, "").trim();
}

export function validateDni(value) {
  const normalized = normalizeDni(value);
  if (!/^\d{7,9}$/.test(normalized)) {
    throw new ApiError(400, "El DNI es obligatorio y debe contener entre 7 y 9 dígitos.");
  }
  return normalized;
}

export function hashDni(normalizedDni) {
  return crypto
    .createHmac("sha256", env.dniHashSecret)
    .update(normalizedDni)
    .digest("hex");
}

export function maskDni(normalizedDni) {
  const lastThree = normalizedDni.slice(-3).padStart(3, "*");
  return `**.***.${lastThree}`;
}

export function getDniIdentity(value) {
  const normalized = validateDni(value);
  return {
    normalized,
    hash: hashDni(normalized),
    mask: maskDni(normalized),
  };
}
