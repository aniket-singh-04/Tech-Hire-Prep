import { clearRefreshCookie, getCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from "../common/cookies.js";
import { sendNoContent, sendSuccess } from "../common/http.js";
import { loginService, logoutService, refreshService, registerService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body, { requestId: req.requestId, ipAddress: req.ip });
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body, { requestId: req.requestId, ipAddress: req.ip });
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshService(req.body.refreshToken ?? getCookie(req, REFRESH_COOKIE_NAME), { requestId: req.requestId, ipAddress: req.ip });
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.body.refreshToken ?? getCookie(req, REFRESH_COOKIE_NAME), { requestId: req.requestId, ipAddress: req.ip, actorUserId: req.user?.id });
  clearRefreshCookie(res);
  sendNoContent(res);
});
