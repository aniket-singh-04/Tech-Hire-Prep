import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody, validateParams } from "../middlewares/validation.middleware.ts";
import {
  editorTemplatesController,
  editorSessionController,
  editorSaveController,
  editorRunController,
  editorResetController
} from "../controllers/editor.controller.ts";
import {
  sessionIdParamsSchema,
  editorSaveSchema,
  editorRunSchema,
  editorResetSchema
} from "../validators/editor.validation.ts";

const editorRoute: ExpressRouter = Router();

editorRoute.use(protect);
editorRoute.get("/templates", editorTemplatesController);
editorRoute.get("/session/:sessionId", validateParams(sessionIdParamsSchema), editorSessionController);
editorRoute.post("/session/:sessionId/save", validateParams(sessionIdParamsSchema), validateBody(editorSaveSchema), editorSaveController);
editorRoute.post("/session/:sessionId/run", validateParams(sessionIdParamsSchema), validateBody(editorRunSchema), editorRunController);
editorRoute.post("/session/:sessionId/reset", validateParams(sessionIdParamsSchema), validateBody(editorResetSchema), editorResetController);

export default editorRoute;
