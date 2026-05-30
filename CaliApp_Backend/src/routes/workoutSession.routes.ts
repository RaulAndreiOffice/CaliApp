import { Router } from "express";
import { workoutSessionController } from "../controllers/workoutSession.controller";
import { performedSetController } from "../controllers/performedSet.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { addSessionRowSchema, logCardioSchema, logRestDaySchema, startSessionSchema, updateSessionSchema } from "../validators/workoutSession.validator";
import { createPerformedSetSchema, updatePerformedSetSchema } from "../validators/performedSet.validator";

const router = Router();

router.use(authenticate);

// Sessions
router.get("/", workoutSessionController.getAll);
router.post("/rest-day", validate(logRestDaySchema), workoutSessionController.logRestDay);
router.post("/cardio", validate(logCardioSchema), workoutSessionController.logCardio);
router.get("/:id", workoutSessionController.getById);
router.post("/", validate(startSessionSchema), workoutSessionController.start);
router.patch("/:id", validate(updateSessionSchema), workoutSessionController.update);
router.delete("/:id", workoutSessionController.delete);
router.post("/:id/rows", validate(addSessionRowSchema), workoutSessionController.addRow);

// Performed Sets
router.post("/:sessionId/rows/:rowId/sets", validate(createPerformedSetSchema), performedSetController.create);
router.patch("/:sessionId/rows/:rowId/sets/:setId", validate(updatePerformedSetSchema), performedSetController.update);
router.delete("/:sessionId/rows/:rowId/sets/:setId", performedSetController.delete);

export default router;
