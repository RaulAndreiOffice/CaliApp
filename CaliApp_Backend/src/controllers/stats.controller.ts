import { Request, Response, NextFunction } from "express";
import { statsService } from "../services/stats.service";
import { sendSuccess } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";

export const statsController = {
  getOverview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await statsService.getOverview(req.user!.id);
      sendSuccess(res, overview);
    } catch (err) { next(err); }
  },

  getWeekly: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await statsService.getWeeklyStats(req.user!.id);
      sendSuccess(res, stats);
    } catch (err) { next(err); }
  },

  getTrainingLoadDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weeks = parseInt(req.query.weeks as string, 10) || 6;
      const stats = await statsService.getTrainingLoadDashboard(req.user!.id, weeks);
      sendSuccess(res, stats);
    } catch (err) { next(err); }
  },

  getExerciseProgress: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weeks = parseInt(req.query.weeks as string, 10) || 8;
      const progress = await statsService.getExerciseProgress(req.user!.id, getRouteParam(req, "id"), weeks);
      sendSuccess(res, progress);
    } catch (err) { next(err); }
  },
};
