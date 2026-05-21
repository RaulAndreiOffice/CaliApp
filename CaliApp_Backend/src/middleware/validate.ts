import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/apiError";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw AppError.badRequest("Validation failed", details);
    }

    req.body = result.data;
    next();
  };
};
