import { Router } from "express";

import * as controller from "../controllers/trainer.controller.js";
import {
  authRequired,
  requireAdmin,
  requireRole,
  requireTrainerApproved,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const trainerRouter = Router();

trainerRouter.use(authRequired);
trainerRouter.get("/", asyncHandler(controller.list));
trainerRouter.get("/me", asyncHandler(controller.me));
trainerRouter.get("/me/availability", requireTrainerApproved, asyncHandler(controller.myAvailability));
trainerRouter.post("/me/availability", requireTrainerApproved, asyncHandler(controller.createAvailability));
trainerRouter.delete("/me/availability/:availabilityId", requireTrainerApproved, asyncHandler(controller.deleteAvailability));
trainerRouter.post("/apply", requireRole("Cliente"), asyncHandler(controller.apply));
trainerRouter.patch("/me", asyncHandler(controller.updateMe));
trainerRouter.patch("/:id/approve", requireAdmin, asyncHandler(controller.approve));
trainerRouter.patch("/:id/reject", requireAdmin, asyncHandler(controller.reject));
trainerRouter.get("/:id/availability", asyncHandler(controller.publicAvailability));
trainerRouter.get("/:id", asyncHandler(controller.getById));
