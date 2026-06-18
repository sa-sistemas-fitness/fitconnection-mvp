import { Router } from "express";

import * as controller from "../controllers/review.controller.js";
import { authRequired, requireAdmin, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const reviewRouter = Router();
reviewRouter.use(authRequired);
reviewRouter.post("/", requireRole("Cliente"), asyncHandler(controller.create));
reviewRouter.get("/trainer/:id", asyncHandler(controller.trainerReviews));
reviewRouter.get(
  "/pending-moderation",
  requireAdmin,
  asyncHandler(controller.pending),
);
reviewRouter.patch("/:id/moderate", requireAdmin, asyncHandler(controller.moderate));
