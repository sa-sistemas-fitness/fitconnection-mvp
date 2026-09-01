import { ApiError } from "../errors/api-error.js";

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;

export function validPersonName(value, label) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60 || !NAME_PATTERN.test(name)) {
    throw new ApiError(
      400,
      `${label} debe tener entre 2 y 60 caracteres y contener sólo letras, espacios, apóstrofes o guiones.`,
    );
  }
  return name;
}
