import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { certificationRouter } from "./routes/certification.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { connectionRouter } from "./routes/connection.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { specialtyRouter } from "./routes/specialty.routes.js";
import { trainerRouter } from "./routes/trainer.routes.js";
import { turnRouter } from "./routes/turn.routes.js";
import { userRouter } from "./routes/user.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    app: "FitConnection",
    database: env.databaseProvider,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/trainers", trainerRouter);
app.use("/api/specialties", specialtyRouter);
app.use("/api/certifications", certificationRouter);
app.use("/api/connection-requests", connectionRouter);
app.use("/api/chats", chatRouter);
app.use("/api/turns", turnRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/reports", reportRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
