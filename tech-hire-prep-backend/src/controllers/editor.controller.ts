import { sendSuccess } from "../common/http.js";
import { getEditorTemplates, getSessionEditor, resetSessionEditor, runSessionCode, saveSessionEditor } from "../services/editor.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const editorTemplatesController = asyncHandler(async (_req, res) => {
  sendSuccess(res, await getEditorTemplates());
});

export const editorSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await getSessionEditor(sessionId, req.user!.id));
});

export const editorSaveController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await saveSessionEditor(sessionId, req.user!.id, req.body));
});

export const editorRunController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await runSessionCode(sessionId, req.user!.id, req.body));
});

export const editorResetController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await resetSessionEditor(sessionId, req.user!.id, req.body.templateId));
});
