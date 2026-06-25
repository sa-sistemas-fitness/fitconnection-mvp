import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está configurada. Crear backend/.env");
}

const { app } = await import("./app.js");
const { env } = await import("./config/env.js");
const { prisma } = await import("./lib/prisma.js");
const { verifySmtpTransport } = await import("./services/email.service.js");

await verifySmtpTransport();

const server = app.listen(env.port, () => {
  console.log(`FitConnection API disponible en http://localhost:${env.port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
