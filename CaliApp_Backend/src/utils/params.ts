import { Request } from "express";
import { AppError } from "./apiError";

export function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw AppError.badRequest(`Invalid route parameter: ${name}`);
  }
  return value;
}
