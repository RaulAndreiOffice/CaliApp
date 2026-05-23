import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authRateLimiter, refreshRateLimiter } from "../middleware/rateLimiter";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", refreshRateLimiter, validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);

export default router;
