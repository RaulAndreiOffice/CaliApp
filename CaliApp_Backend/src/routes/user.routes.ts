import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { changePasswordSchema, updateUserSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/me", validate(updateUserSchema), userController.updateMe);
router.patch("/me/password", validate(changePasswordSchema), userController.changePassword);

export default router;
