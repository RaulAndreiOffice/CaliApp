import { Request, Response, NextFunction } from "express";
import { performedSetService } from "../services/performedSet.service";
import { sendCreated, sendSuccess, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { CreatePerformedSetDTO } from "../dtos/performed-set/create-performed-set.dto";

export const performedSetController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const set = await performedSetService.create(req.user!.id, getRouteParam(req, "sessionId"), getRouteParam(req, "rowId"), req.body as CreatePerformedSetDTO);
      sendCreated(res, set);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const set = await performedSetService.update(req.user!.id, getRouteParam(req, "sessionId"), getRouteParam(req, "rowId"), getRouteParam(req, "setId"), req.body as Partial<CreatePerformedSetDTO>);
      sendSuccess(res, set);
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await performedSetService.delete(req.user!.id, getRouteParam(req, "sessionId"), getRouteParam(req, "rowId"), getRouteParam(req, "setId"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
