import { ApiError } from "../errors/api-error.js";

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function requiredTime(value, label) {
  const time = String(value ?? "").trim();
  if (!TIME_PATTERN.test(time)) {
    throw new ApiError(400, `${label} debe usar el formato HH:mm.`);
  }
  return time;
}

export function validateTimeRange(startValue, endValue) {
  const horaInicio = requiredTime(startValue, "horaInicio");
  const horaFin = requiredTime(endValue, "horaFin");
  if (horaFin <= horaInicio) {
    throw new ApiError(400, "horaFin debe ser posterior a horaInicio.");
  }
  return { horaInicio, horaFin };
}

export const intervalsOverlap = (startA, endA, startB, endB) =>
  startA < endB && endA > startB;

export function utcWeekday(date) {
  return new Date(date).getUTCDay();
}

export function sameUtcDate(left, right) {
  return new Date(left).toISOString().slice(0, 10) === new Date(right).toISOString().slice(0, 10);
}
