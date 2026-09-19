export const ErrorCode = {
  AuthRequired: "AUTH_REQUIRED",
  PermissionDenied: "PERMISSION_DENIED",
  RequestNotFound: "REQUEST_NOT_FOUND",
  OfferNotFound: "OFFER_NOT_FOUND",
  InvalidJobTransition: "INVALID_JOB_TRANSITION",
  AiUnavailable: "AI_UNAVAILABLE",
  NetworkError: "NETWORK_ERROR",
  ValidationError: "VALIDATION_ERROR",
  NotFound: "NOT_FOUND",
  InternalError: "INTERNAL_ERROR",
  InvalidCredentials: "INVALID_CREDENTIALS",
  AccountInactive: "ACCOUNT_INACTIVE",
  Conflict: "CONFLICT",
  InvalidRequestState: "INVALID_REQUEST_STATE",
  OfferAlreadyAccepted: "OFFER_ALREADY_ACCEPTED",
  JobNotFound: "JOB_NOT_FOUND",
  ReviewNotEligible: "REVIEW_NOT_ELIGIBLE",
  InsufficientPoints: "INSUFFICIENT_POINTS",
  ProRequired: "PRO_REQUIRED"
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
