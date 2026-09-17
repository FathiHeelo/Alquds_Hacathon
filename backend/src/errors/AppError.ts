import type { ErrorCode } from "./errorCodes";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
  }
}
