import { Response } from "express";
import type { SuccessResponseDTO } from "../dtos/common/api-response.dto";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: any) => {
  const response: SuccessResponseDTO<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T) => {
  return sendSuccess(res, data, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};
