import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authRateLimiter, refreshRateLimiter } from "../middleware/rateLimiter";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
// The refresh token now travels in an httpOnly cookie, not the request body,
// so these endpoints no longer validate a body schema.
router.post("/refresh", refreshRateLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;
