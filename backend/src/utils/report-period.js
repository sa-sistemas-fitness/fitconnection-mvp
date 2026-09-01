import { ApiError } from "../errors/api-error.js";

function parseDay(value, label) {
  const normalized = String(value ?? "").trim();

  if (!normalized) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new ApiError(400, `${label} debe usar el formato YYYY-MM-DD.`);
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== normalized
  ) {
    throw new ApiError(400, `${label} no es una fecha válida.`);
  }

  return date;
}

export function reportDateWhere(query, field) {
  const from = parseDay(query.desde, "desde");
  const to = parseDay(query.hasta, "hasta");

  if (from && to && from > to) {
    throw new ApiError(400, "desde no puede ser posterior a hasta.");
  }

  if (!from && !to) return {};

  const range = {};

  if (from) {
    range.gte = from;
  }

  if (to) {
    const exclusiveEnd = new Date(to);
    exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
    range.lt = exclusiveEnd;
  }

  return {
    [field]: range,
  };
}