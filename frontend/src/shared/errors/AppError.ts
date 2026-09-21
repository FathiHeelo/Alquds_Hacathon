export type AppErrorCode =
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "REQUEST_CLOSED"
  | "DUPLICATE_OFFER"
  | "OFFER_ALREADY_ACCEPTED"
  | "INVALID_JOB_TRANSITION"
  | "DUPLICATE_REVIEW"
  | "INSUFFICIENT_REWARD_BALANCE"
  | "PRO_REQUIRED"
  | "SERVER_UNAVAILABLE"
  | "NETWORK_TIMEOUT"
  | "AI_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown,
    public readonly backendCode?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
