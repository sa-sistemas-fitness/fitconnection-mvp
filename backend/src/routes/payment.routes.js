import { Router } from "express";

import * as controller from "../controllers/payment.controller.js";
import {
  authRequired,
  requireAdmin,
  requireRole,
  requireTrainerApproved,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const paymentRouter = Router();
paymentRouter.use(authRequired);
paymentRouter.post("/", requireRole("Cliente"), asyncHandler(controller.create));
paymentRouter.get("/my", requireRole("Cliente"), asyncHandler(controller.my));
paymentRouter.get("/received", requireTrainerApproved, asyncHandler(controller.received));
paymentRouter.get("/", requireAdmin, asyncHandler(controller.list));
paymentRouter.patch("/:id/status", requireAdmin, asyncHandler(controller.updateStatus));
