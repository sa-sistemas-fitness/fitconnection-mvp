import { Router } from "express";

import * as controller from "../controllers/chat.controller.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const chatRouter = Router();
chatRouter.use(authRequired);
chatRouter.get("/", asyncHandler(controller.list));
chatRouter.get("/:id/messages", asyncHandler(controller.messages));
chatRouter.post("/:id/messages", asyncHandler(controller.sendMessage));
