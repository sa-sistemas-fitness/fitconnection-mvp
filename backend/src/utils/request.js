import { ApiError } from "../errors/api-error.js";

export function parseId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} inválido.`);
  }
  return id;
}

export function requiredString(value, label) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new ApiError(400, `${label} es obligatorio.`);
  }
  return normalized;
}

export function optionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function requiredNumber(value, label, { min = 0 } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min) {
    throw new ApiError(400, `${label} debe ser un número válido.`);
  }
  return number;
}

export function requiredDate(value, label) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${label} debe ser una fecha válida.`);
  }
  return date;
}
