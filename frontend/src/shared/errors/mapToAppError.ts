import { AppError, type AppErrorCode } from "./AppError";

type HttpLikeError = { status?: number; message?: string };

const statusCodes: Partial<Record<number, AppErrorCode>> = {
  400: "VALIDATION_ERROR",
  401: "AUTH_REQUIRED",
  403: "PERMISSION_DENIED"
};

export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const candidate = error as HttpLikeError;
  if (candidate?.status) {
    return new AppError(
      statusCodes[candidate.status] ?? "UNKNOWN_ERROR",
      candidate.message ?? "The request could not be completed.",
      error
    );
  }

  if (error instanceof TypeError) {
    return new AppError("NETWORK_ERROR", "Unable to reach the service.", error);
  }

  return new AppError("UNKNOWN_ERROR", "Something went wrong.", error);
}
