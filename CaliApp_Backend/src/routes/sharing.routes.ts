import { Router } from "express";
import { sharingController } from "../controllers/sharing.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/", sharingController.getSharedWithMe);
router.post("/:id/copy", sharingController.copyShared);

export default router;
