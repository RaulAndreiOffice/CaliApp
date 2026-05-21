import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import type { LoginRequestDTO } from "../dtos/auth/login.dto";
import type { RegisterRequestDTO } from "../dtos/auth/register.dto";
import type { TokensResponseDTO } from "../dtos/auth/tokens.dto";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body as RegisterRequestDTO);
      sendCreated(res, result);
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body as LoginRequestDTO);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as TokensResponseDTO;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as TokensResponseDTO;
      await authService.logout(refreshToken);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
