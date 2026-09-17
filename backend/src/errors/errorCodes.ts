export const ErrorCode = {
  AuthRequired: "AUTH_REQUIRED",
  PermissionDenied: "PERMISSION_DENIED",
  RequestNotFound: "REQUEST_NOT_FOUND",
  OfferNotFound: "OFFER_NOT_FOUND",
  InvalidJobTransition: "INVALID_JOB_TRANSITION",
  AiUnavailable: "AI_UNAVAILABLE",
  NetworkError: "NETWORK_ERROR",
  ValidationError: "VALIDATION_ERROR"
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
