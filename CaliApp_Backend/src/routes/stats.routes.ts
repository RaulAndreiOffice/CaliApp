import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/overview", statsController.getOverview);
router.get("/weekly", statsController.getWeekly);
router.get("/training-load", statsController.getTrainingLoadDashboard);
router.get("/exercise/:id", statsController.getExerciseProgress);
router.get("/progress-insights", statsController.getProgressInsights);

export default router;
