import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.patch("/me/password", userController.changePassword);

export default router;
