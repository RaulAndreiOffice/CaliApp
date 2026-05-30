import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import exerciseRoutes from "./exercise.routes";
import workoutTableRoutes from "./workoutTable.routes";
import workoutSessionRoutes from "./workoutSession.routes";
import sharingRoutes from "./sharing.routes";
import statsRoutes from "./stats.routes";
import { generalApiLimiter } from "../middleware/rateLimiter";

const router = Router();

// Health stays above the limiter so Railway's healthcheck is never throttled.
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global rate ceiling for every resource/auth route below (auth routes keep
// their own stricter limiter on top).
router.use(generalApiLimiter);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/workout-tables", workoutTableRoutes);
router.use("/workout-sessions", workoutSessionRoutes);
router.use("/shared-with-me", sharingRoutes);
router.use("/stats", statsRoutes);

export default router;
