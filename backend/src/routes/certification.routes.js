import { Router } from "express";

import * as controller from "../controllers/certification.controller.js";
import { authRequired, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const certificationRouter = Router();
certificationRouter.use(authRequired);
certificationRouter.post("/", asyncHandler(controller.create));
certificationRouter.get("/my", asyncHandler(controller.my));
certificationRouter.get("/pending", requireAdmin, asyncHandler(controller.pending));
certificationRouter.patch("/:id/approve", requireAdmin, asyncHandler(controller.approve));
certificationRouter.patch("/:id/reject", requireAdmin, asyncHandler(controller.reject));
