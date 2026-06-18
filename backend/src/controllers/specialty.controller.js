import { prisma } from "../lib/prisma.js";

export async function list(_request, response) {
  response.json({
    specialties: await prisma.especialidad.findMany({ orderBy: { nombre: "asc" } }),
  });
}
