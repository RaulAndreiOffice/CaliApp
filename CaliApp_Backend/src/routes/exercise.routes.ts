import { Router } from "express";
import { exerciseController } from "../controllers/exercise.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createExerciseSchema, updateExerciseSchema } from "../validators/exercise.validator";

const router = Router();

router.use(authenticate);

router.get("/", exerciseController.getAll);
router.get("/:id", exerciseController.getById);
router.post("/", validate(createExerciseSchema), exerciseController.create);
router.patch("/:id", validate(updateExerciseSchema), exerciseController.update);
router.delete("/:id", exerciseController.archive);

export default router;
