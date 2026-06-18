export const money = (value = 0) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export const shortDate = (value) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));

export const fullDate = (value) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));

export const trainerName = (trainer) =>
  `${trainer?.usuario?.nombre ?? ""} ${trainer?.usuario?.apellido ?? ""}`.trim();

export const trainerSpecialties = (trainer) =>
  trainer?.especialidades?.map(({ especialidad }) => especialidad.nombre) ?? [];
