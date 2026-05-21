import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiError";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined,
      },
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
