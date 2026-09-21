import { AppError, type AppErrorCode } from "./AppError";

type HttpLikeError = { status?: number; message?: string; code?: string; name?: string };

const statusCodes: Partial<Record<number, AppErrorCode>> = {
  400: "VALIDATION_ERROR",
  401: "AUTH_REQUIRED",
  403: "PERMISSION_DENIED"
  ,404: "NOT_FOUND",
  409: "CONFLICT",
  500: "SERVER_UNAVAILABLE",
  502: "SERVER_UNAVAILABLE",
  503: "SERVER_UNAVAILABLE"
};

const backendCodes: Record<string, AppErrorCode> = {
  INVALID_REQUEST_STATE: "REQUEST_CLOSED",
  OFFER_ALREADY_ACCEPTED: "OFFER_ALREADY_ACCEPTED",
  INVALID_JOB_TRANSITION: "INVALID_JOB_TRANSITION",
  INSUFFICIENT_POINTS: "INSUFFICIENT_REWARD_BALANCE",
  PRO_REQUIRED: "PRO_REQUIRED",
  CONFLICT: "CONFLICT"
};

function mapConflict(message = ""): AppErrorCode | undefined {
  if (/already sent an offer/i.test(message)) return "DUPLICATE_OFFER";
  if (/already reviewed/i.test(message)) return "DUPLICATE_REVIEW";
  return undefined;
}

export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const candidate = error as HttpLikeError;
  if (candidate?.status) {
    return new AppError(
      (candidate.code === "CONFLICT" ? mapConflict(candidate.message) : undefined) ??
        (candidate.code ? backendCodes[candidate.code] : undefined) ?? statusCodes[candidate.status] ?? "UNKNOWN_ERROR",
      candidate.message ?? "The request could not be completed.",
      error,
      candidate.code
    );
  }

  if (candidate?.name === "AbortError") return new AppError("NETWORK_TIMEOUT", "The service took too long to respond.", error);
  if (error instanceof TypeError) {
    return new AppError("NETWORK_ERROR", "Unable to reach the service.", error);
  }

  return new AppError("UNKNOWN_ERROR", "Something went wrong.", error);
}
