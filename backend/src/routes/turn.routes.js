import { Router } from "express";

import * as controller from "../controllers/turn.controller.js";
import {
  authRequired,
  requireRole,
  requireTrainerApproved,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const turnRouter = Router();
turnRouter.use(authRequired);
turnRouter.post("/", requireRole("Cliente"), asyncHandler(controller.create));
turnRouter.get("/my", requireRole("Cliente"), asyncHandler(controller.my));
turnRouter.get("/received", requireTrainerApproved, asyncHandler(controller.received));
turnRouter.patch("/:id/accept", requireTrainerApproved, asyncHandler(controller.accept));
turnRouter.patch("/:id/reject", requireTrainerApproved, asyncHandler(controller.reject));
turnRouter.patch("/:id/cancel", asyncHandler(controller.cancel));
turnRouter.patch("/:id/finish", requireTrainerApproved, asyncHandler(controller.finish));
