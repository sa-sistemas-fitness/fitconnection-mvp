import { ApiError } from "../errors/api-error.js";

export function parseDateOfBirth(value) {
  if (!value) throw new ApiError(400, "fechaNacimiento es obligatoria.");
  const rawDate = String(value).slice(0, 10);
  const date = new Date(`${rawDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== rawDate) {
    throw new ApiError(400, "fechaNacimiento no es válida.");
  }
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  if (date.getTime() >= todayUtc) {
    throw new ApiError(400, "fechaNacimiento debe ser anterior a hoy.");
  }
  return date;
}

export function calculateAge(dateOfBirth, at = new Date()) {
  const birth = new Date(dateOfBirth);
  let age = at.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    at.getUTCMonth() < birth.getUTCMonth() ||
    (at.getUTCMonth() === birth.getUTCMonth() &&
      at.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function isMinor(dateOfBirth, at = new Date()) {
  return calculateAge(dateOfBirth, at) < 18;
}
