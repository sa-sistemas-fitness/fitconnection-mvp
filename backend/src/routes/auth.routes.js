import { Router } from "express";

import * as controller from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(controller.register));
authRouter.post("/login", asyncHandler(controller.login));
authRouter.post("/forgot-password", asyncHandler(controller.forgotPassword));
authRouter.post("/reset-password", asyncHandler(controller.resetPassword));
authRouter.get("/me", authRequired, asyncHandler(controller.me));
