import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { sendSuccess, sendNoContent } from "../utils/apiResponse";
import type { ChangePasswordDTO, UpdateUserDTO } from "../dtos/user/update-user.dto";

export const userController = {
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getMe(req.user!.id);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.updateMe(req.user!.id, req.body as UpdateUserDTO);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.changePassword(req.user!.id, req.body as ChangePasswordDTO);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
