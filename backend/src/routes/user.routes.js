import { Router } from "express";

import * as controller from "../controllers/user.controller.js";
import { authRequired, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const userRouter = Router();

userRouter.use(authRequired, requireAdmin);
userRouter.get("/", asyncHandler(controller.list));
userRouter.get("/:id", asyncHandler(controller.getById));
userRouter.patch("/:id/status", asyncHandler(controller.updateStatus));
