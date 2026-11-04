import type { ErrorCode } from "./api/types";

/** Codes from the API, plus two the client adds when no API answer arrives. */
export type ClientErrorCode = ErrorCode | "NETWORK_ERROR" | "UNKNOWN";

/** The only error type that crosses the data layer (ENGINEERING.md section 7). */
export class ApiError extends Error {
  constructor(
    readonly code: ClientErrorCode,
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown, code?: ClientErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

const MESSAGES: Record<ClientErrorCode, string> = {
  INVALID_INPUT: "Some details need fixing. Please check the form.",
  INVALID_CREDENTIALS: "Wrong email or password.",
  UNAUTHENTICATED: "Please log in to continue.",
  FORBIDDEN: "You do not have access to this.",
  NOT_FOUND: "We could not find that.",
  INVALID_SLOT: "That time is no longer available. Please pick another time.",
  INVALID_TOKEN: "This reset link is invalid or has expired. Please ask for a new one.",
  EMAIL_TAKEN: "An account with this email already exists. Try logging in.",
  SLOT_TAKEN:
    "Sorry, that time was just taken by someone else. Your prayer point is saved. Please pick another time.",
  WEEKLY_LIMIT: "You already have a booking that week. You can book one session per week.",
  INVALID_STATE: "This can no longer be changed.",
  SCHEDULE_CONFLICT: "This overlaps another session on the same day.",
  RATE_LIMITED: "Too many tries. Please wait a minute and try again.",
  NETWORK_ERROR: "We could not reach the server. Check your connection and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

/** The user-facing message for an error code. Screens fall back to this. */
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? MESSAGES[error.code] : MESSAGES.UNKNOWN;
}
