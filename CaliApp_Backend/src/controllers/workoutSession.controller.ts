import { Request, Response, NextFunction } from "express";
import { workoutSessionService } from "../services/workoutSession.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getRouteParam } from "../utils/params";
import type { LogRestDayDTO } from "../dtos/workout-session/log-rest-day.dto";
import type { StartSessionDTO } from "../dtos/workout-session/start-session.dto";
import type { AddSessionRowDTO } from "../dtos/workout-session/add-session-row.dto";
import type { SessionStatus } from "../models/workoutSession.model";

export const workoutSessionController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await workoutSessionService.getAll(req.user!.id, req.query);
      sendSuccess(res, result.data, 200, result.meta);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await workoutSessionService.getById(req.user!.id, getRouteParam(req, "id"));
      sendSuccess(res, session);
    } catch (err) { next(err); }
  },

  start: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await workoutSessionService.start(req.user!.id, req.body as StartSessionDTO);
      sendCreated(res, session);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as { status: SessionStatus; notes?: string };
      const session = await workoutSessionService.updateStatus(req.user!.id, getRouteParam(req, "id"), body.status, body.notes);
      sendSuccess(res, session);
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await workoutSessionService.delete(req.user!.id, getRouteParam(req, "id"));
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  logRestDay: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await workoutSessionService.logRestDay(req.user!.id, req.body as LogRestDayDTO);
      sendCreated(res, session);
    } catch (err) { next(err); }
  },

  addRow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await workoutSessionService.addRow(
        req.user!.id,
        getRouteParam(req, "id"),
        req.body as AddSessionRowDTO,
      );
      sendCreated(res, session);
    } catch (err) { next(err); }
  },
};
