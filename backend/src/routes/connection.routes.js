import { Router } from "express";

import * as controller from "../controllers/connection.controller.js";
import {
  authRequired,
  requireRole,
  requireTrainerApproved,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const connectionRouter = Router();
connectionRouter.use(authRequired);
connectionRouter.post("/", requireRole("Cliente"), asyncHandler(controller.create));
connectionRouter.get("/my", requireRole("Cliente"), asyncHandler(controller.my));
connectionRouter.get(
  "/received",
  requireTrainerApproved,
  asyncHandler(controller.received),
);
connectionRouter.patch(
  "/:id/accept",
  requireTrainerApproved,
  asyncHandler(controller.accept),
);
connectionRouter.patch(
  "/:id/reject",
  requireTrainerApproved,
  asyncHandler(controller.reject),
);
