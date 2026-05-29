import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from "../utils/authCookie";
import { AppError } from "../utils/apiError";
import type { LoginRequestDTO } from "../dtos/auth/login.dto";
import type { RegisterRequestDTO } from "../dtos/auth/register.dto";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body as RegisterRequestDTO);
      setRefreshCookie(res, refreshToken);
      sendCreated(res, { user, accessToken });
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body as LoginRequestDTO);
      setRefreshCookie(res, refreshToken);
      sendSuccess(res, { user, accessToken });
    } catch (err) { next(err); }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = readRefreshCookie(req);
      if (!refreshToken) throw AppError.unauthorized("Missing refresh token");
      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);
      setRefreshCookie(res, newRefreshToken);
      sendSuccess(res, { accessToken });
    } catch (err) { next(err); }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = readRefreshCookie(req);
      if (refreshToken) await authService.logout(refreshToken);
      clearRefreshCookie(res);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
