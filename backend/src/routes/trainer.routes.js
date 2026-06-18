import { Router } from "express";

import * as controller from "../controllers/trainer.controller.js";
import {
  authRequired,
  requireAdmin,
  requireRole,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const trainerRouter = Router();

trainerRouter.get("/", asyncHandler(controller.list));
trainerRouter.use(authRequired);
trainerRouter.get("/me", asyncHandler(controller.me));
trainerRouter.post("/apply", requireRole("Cliente"), asyncHandler(controller.apply));
trainerRouter.patch("/me", asyncHandler(controller.updateMe));
trainerRouter.patch("/:id/approve", requireAdmin, asyncHandler(controller.approve));
trainerRouter.patch("/:id/reject", requireAdmin, asyncHandler(controller.reject));
trainerRouter.get("/:id", asyncHandler(controller.getById));
