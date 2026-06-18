import "dotenv/config";

import { defineConfig } from "prisma/config";

const configuredDatabaseUrl = process.env.DATABASE_URL ?? "";
const isPostgresqlUrl =
  configuredDatabaseUrl.startsWith("postgresql://") ||
  configuredDatabaseUrl.startsWith("postgres://");

if (process.env.NODE_ENV === "production" && !isPostgresqlUrl) {
  throw new Error(
    "DATABASE_URL debe apuntar a PostgreSQL en producción.",
  );
}

const databaseUrl = isPostgresqlUrl
  ? configuredDatabaseUrl
  : "postgresql://fitconnection:fitconnection@localhost:5432/fitconnection?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations-postgresql",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: databaseUrl,
  },
});
