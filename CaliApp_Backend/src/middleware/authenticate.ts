import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import { AppError } from "../utils/apiError";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, jwtConfig.accessSecret) as { userId: string; email: string };
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
};
