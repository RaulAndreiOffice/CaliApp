import { Router } from "express";
import { workoutTableController } from "../controllers/workoutTable.controller";
import { workoutTableRowController } from "../controllers/workoutTableRow.controller";
import { sharingController } from "../controllers/sharing.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createWorkoutTableSchema,
  updateWorkoutTableSchema,
  createWorkoutTableRowSchema,
  updateWorkoutTableRowSchema,
  reorderRowsSchema,
} from "../validators/workoutTable.validator";
import { createShareSchema } from "../validators/sharing.validator";

const router = Router();

router.use(authenticate);

// Tables
router.get("/", workoutTableController.getAll);
router.get("/:id", workoutTableController.getById);
router.post("/", validate(createWorkoutTableSchema), workoutTableController.create);
router.patch("/:id", validate(updateWorkoutTableSchema), workoutTableController.update);
router.delete("/:id", workoutTableController.archive);

// Rows
router.get("/:id/rows", workoutTableRowController.getByTableId);
router.post("/:id/rows", validate(createWorkoutTableRowSchema), workoutTableRowController.create);
router.patch("/:id/rows/reorder", validate(reorderRowsSchema), workoutTableRowController.reorder);
router.patch("/:id/rows/:rowId", validate(updateWorkoutTableRowSchema), workoutTableRowController.update);
router.delete("/:id/rows/:rowId", workoutTableRowController.delete);

// Sharing
router.post("/:id/share", validate(createShareSchema), sharingController.share);
router.get("/:id/shares", sharingController.getShares);
router.delete("/:id/shares/:shareId", sharingController.revoke);

export default router;
