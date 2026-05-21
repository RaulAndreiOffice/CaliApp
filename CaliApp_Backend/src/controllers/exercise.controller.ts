import { Request, Response, NextFunction } from "express";
import { exerciseService } from "../services/exercise.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { CreateExerciseDTO } from "../dtos/exercise/create-exercise.dto";
import type { UpdateExerciseDTO } from "../dtos/exercise/update-exercise.dto";

export const exerciseController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercises = await exerciseService.getAll(req.user!.id);
      sendSuccess(res, exercises);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercise = await exerciseService.getById(req.user!.id, getRouteParam(req, "id"));
      sendSuccess(res, exercise);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercise = await exerciseService.create(req.user!.id, req.body as CreateExerciseDTO);
      sendCreated(res, exercise);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercise = await exerciseService.update(req.user!.id, getRouteParam(req, "id"), req.body as UpdateExerciseDTO);
      sendSuccess(res, exercise);
    } catch (err) { next(err); }
  },

  archive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await exerciseService.archive(req.user!.id, getRouteParam(req, "id"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
