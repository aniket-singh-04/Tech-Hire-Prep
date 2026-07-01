import { Router } from "express";
import { validateBody } from "../common/validation.middleware.js";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";
import { rateLimit } from "../middlewares/security.middleware.js";
import { loginSchema, refreshSchema, registerSchema } from "../modules/auth/auth.schemas.js";

const authRoute: Router = Router();

authRoute.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 25, keyPrefix: "auth" }));

authRoute.post("/register", validateBody(registerSchema), register);
authRoute.post("/login", validateBody(loginSchema), login);
authRoute.post("/refresh", validateBody(refreshSchema), refresh);
authRoute.post("/logout", validateBody(refreshSchema), logout);

export default authRoute;
