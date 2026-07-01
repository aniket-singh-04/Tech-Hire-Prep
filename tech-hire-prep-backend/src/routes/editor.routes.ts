import { Router, type Router as ExpressRouter } from "express";
import { validateBody, validateParams } from "../common/validation.middleware.js";
import { editorResetController, editorRunController, editorSaveController, editorSessionController, editorTemplatesController } from "../controllers/editor.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { editorResetSchema, editorRunSchema, editorSaveSchema } from "../modules/editor/editor.schemas.js";
import { sessionIdParamsSchema } from "../modules/sessions/session.schemas.js";

const editorRoute: ExpressRouter = Router();

editorRoute.use(requireAuth);
editorRoute.get("/templates", editorTemplatesController);
editorRoute.get("/session/:sessionId", validateParams(sessionIdParamsSchema), editorSessionController);
editorRoute.post("/session/:sessionId/save", validateParams(sessionIdParamsSchema), validateBody(editorSaveSchema), editorSaveController);
editorRoute.post("/session/:sessionId/run", validateParams(sessionIdParamsSchema), validateBody(editorRunSchema), editorRunController);
editorRoute.post("/session/:sessionId/reset", validateParams(sessionIdParamsSchema), validateBody(editorResetSchema), editorResetController);

export default editorRoute;

