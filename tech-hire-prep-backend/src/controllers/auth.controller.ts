import { clearRefreshCookie, getCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from "../common/cookies.js";
import { loginService, logoutService, refreshService, registerService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);
  setRefreshCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body);
  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshService(req.body.refreshToken ?? getCookie(req, REFRESH_COOKIE_NAME));
  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.body.refreshToken ?? getCookie(req, REFRESH_COOKIE_NAME));
  clearRefreshCookie(res);

  res.status(204).send();
});
