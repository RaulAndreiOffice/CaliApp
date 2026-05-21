import { Request, Response, NextFunction } from "express";
import { sharingService } from "../services/sharing.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { CreateShareDTO } from "../dtos/sharing/create-share.dto";

export const sharingController = {
  share: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const share = await sharingService.share(req.user!.id, getRouteParam(req, "id"), req.body as CreateShareDTO);
      sendCreated(res, share);
    } catch (err) { next(err); }
  },

  getShares: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shares = await sharingService.getSharesByTableId(req.user!.id, getRouteParam(req, "id"));
      sendSuccess(res, shares);
    } catch (err) { next(err); }
  },

  revoke: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sharingService.revoke(req.user!.id, getRouteParam(req, "id"), getRouteParam(req, "shareId"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  getSharedWithMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shared = await sharingService.getSharedWithMe(req.user!.id);
      sendSuccess(res, shared);
    } catch (err) { next(err); }
  },

  copyShared: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const table = await sharingService.copySharedTable(req.user!.id, getRouteParam(req, "id"));
      sendCreated(res, table);
    } catch (err) { next(err); }
  },
};
