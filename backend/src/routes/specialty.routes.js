import { Router } from "express";

import { list } from "../controllers/specialty.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const specialtyRouter = Router();
specialtyRouter.get("/", asyncHandler(list));
