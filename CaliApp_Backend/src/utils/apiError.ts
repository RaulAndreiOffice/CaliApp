export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new AppError(message, 409, "CONFLICT");
  }

  static tooManyRequests(message = "Too many requests") {
    return new AppError(message, 429, "TOO_MANY_REQUESTS");
  }

  static internal(message = "Internal server error") {
    return new AppError(message, 500, "INTERNAL_ERROR");
  }
}
