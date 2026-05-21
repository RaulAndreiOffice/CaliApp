import { Request, Response, NextFunction } from "express";
import { workoutTableRowService } from "../services/workoutTableRow.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { CreateWorkoutTableRowDTO } from "../dtos/workout-table-row/create-workout-table-row.dto";
import type { UpdateWorkoutTableRowDTO } from "../dtos/workout-table-row/update-workout-table-row.dto";

export const workoutTableRowController = {
  getByTableId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await workoutTableRowService.getByTableId(req.user!.id, getRouteParam(req, "id"));
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await workoutTableRowService.create(req.user!.id, getRouteParam(req, "id"), req.body as CreateWorkoutTableRowDTO);
      sendCreated(res, row);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await workoutTableRowService.update(req.user!.id, getRouteParam(req, "id"), getRouteParam(req, "rowId"), req.body as UpdateWorkoutTableRowDTO);
      sendSuccess(res, row);
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await workoutTableRowService.delete(req.user!.id, getRouteParam(req, "id"), getRouteParam(req, "rowId"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  reorder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await workoutTableRowService.reorder(req.user!.id, getRouteParam(req, "id"), req.body.orderedIds);
      sendSuccess(res, { message: "Rows reordered" });
    } catch (err) { next(err); }
  },
};
