import { Prisma } from "@prisma/client";

import { ApiError } from "../errors/api-error.js";

export function notFoundHandler(_request, response) {
  response.status(404).json({ message: "Recurso no encontrado" });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response.status(409).json({
        message: "Ya existe un registro con esos datos.",
      });
    }
    if (error.code === "P2025") {
      return response.status(404).json({ message: "Registro no encontrado." });
    }
  }

  console.error(error);
  return response.status(500).json({
    message: "Ocurrió un error inesperado.",
  });
}
