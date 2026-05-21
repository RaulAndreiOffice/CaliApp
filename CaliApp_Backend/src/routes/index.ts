import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import exerciseRoutes from "./exercise.routes";
import workoutTableRoutes from "./workoutTable.routes";
import workoutSessionRoutes from "./workoutSession.routes";
import sharingRoutes from "./sharing.routes";
import statsRoutes from "./stats.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/workout-tables", workoutTableRoutes);
router.use("/workout-sessions", workoutSessionRoutes);
router.use("/shared-with-me", sharingRoutes);
router.use("/stats", statsRoutes);

export default router;
