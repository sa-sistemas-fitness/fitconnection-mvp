import { Router } from "express";

import * as controller from "../controllers/report.controller.js";
import {
  authRequired,
  requireAdmin,
  requireTrainerApproved,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const reportRouter = Router();
reportRouter.use(authRequired);
reportRouter.get("/admin/overview", requireAdmin, asyncHandler(controller.overview));
reportRouter.get("/connections", requireAdmin, asyncHandler(controller.connections));
reportRouter.get("/financial", requireAdmin, asyncHandler(controller.financial));
reportRouter.get("/trainers", requireAdmin, asyncHandler(controller.trainers));
reportRouter.get(
  "/trainer/me",
  requireTrainerApproved,
  asyncHandler(controller.trainerMe),
);
