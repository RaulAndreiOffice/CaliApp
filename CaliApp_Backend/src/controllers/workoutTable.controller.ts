import { Request, Response, NextFunction } from "express";
import { workoutTableService } from "../services/workoutTable.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { CreateWorkoutTableDTO } from "../dtos/workout-table/create-workout-table.dto";
import type { UpdateWorkoutTableDTO } from "../dtos/workout-table/update-workout-table.dto";

export const workoutTableController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tables = await workoutTableService.getAll(req.user!.id);
      sendSuccess(res, tables);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const table = await workoutTableService.getById(req.user!.id, getRouteParam(req, "id"));
      sendSuccess(res, table);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const table = await workoutTableService.create(req.user!.id, req.body as CreateWorkoutTableDTO);
      sendCreated(res, table);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const table = await workoutTableService.update(req.user!.id, getRouteParam(req, "id"), req.body as UpdateWorkoutTableDTO);
      sendSuccess(res, table);
    } catch (err) { next(err); }
  },

  archive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await workoutTableService.archive(req.user!.id, getRouteParam(req, "id"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
