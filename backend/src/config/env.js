import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  jwtSecret:
    process.env.JWT_SECRET ?? "fitconnection-local-development-secret",
  dniHashSecret:
    process.env.DNI_HASH_SECRET ??
    process.env.JWT_SECRET ??
    "fitconnection-local-development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  frontendUrls: [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean),
  ],
  databaseProvider: (process.env.DATABASE_URL ?? "").startsWith("postgres")
    ? "postgresql"
    : "sqlite",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from:
      process.env.SMTP_FROM?.trim() ||
      "FitConnection <no-reply@fitconnection.local>",
  },
};
