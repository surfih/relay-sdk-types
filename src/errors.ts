/** One field error. `path` is split on `.` (`"error.code"` becomes `["error", "code"]`). An empty path is `[ ]`. */
export interface ValidationIssue {
  path: string[];
  message: string;
}

/** Body of every non-2xx JSON response: `{ "error": { "message", ... } }`. */
export interface ApiErrorResponse {
  error: ApiErrorObject;
}

export interface ApiErrorObject {
  message: string;
  issues?: ValidationIssue[];
  code?: RelayErrorCode | string;
  /** Set when `Idempotency-Key` is reused with a different event body. */
  existing_event_id?: string;
  /** Present on `event_quota_exceeded`. */
  plan_id?: string;
  event_allowance?: number;
  events_used?: number;
  /** Present when schedule creation exceeds the current plan allowance. */
  schedule_limit?: number;
  /**
   * Present on subscription / quota errors from event submit.
   * `null` for perpetual plans or when the client has never subscribed.
   * Omitted on queue-create `subscription_required` (code only).
   */
  expires_at?: string | null;
}

/** `400` with `message: "Validation failed"`. */
export interface ValidationErrorResponse {
  error: {
    message: "Validation failed";
    issues: ValidationIssue[];
  };
}

/** `409` when the same idempotency key is sent with a different submission. */
export interface IdempotencyConflictResponse {
  error: {
    message: string;
    existing_event_id: string;
  };
}

/** `429` once the events included in the current subscription period are used up. */
export interface EventQuotaExceededResponse {
  error: {
    message: string;
    code: "event_quota_exceeded";
    plan_id: string;
    event_allowance: number;
    events_used: number;
    /** `null` on perpetual subscriptions. */
    expires_at: string | null;
  };
}

/**
 * `402` when there is no active subscription.
 * Event submit includes `expires_at` (`null` if never subscribed); queue create may send only `code`.
 */
export interface SubscriptionRequiredResponse {
  error: {
    message: string;
    code: "subscription_required";
    expires_at?: string | null;
  };
}

/** `409` when schedule creation exceeds the current plan allowance. */
export interface ScheduleLimitExceededResponse {
  error: {
    message: string;
    code: "schedule_limit_exceeded";
    schedule_limit: number;
  };
}

/**
 * `429` from the request rate limiter: per API key at the plan's `rate_limit_per_second` (burst twice
 * that; none for perpetual subscriptions), or per IP for requests without a known key. `Retry-After` is set.
 */
export interface RateLimitResponse {
  error: {
    message: "Too many requests";
    code: "rate_limited";
  };
}

export type RelayErrorCode =
  | "event_quota_exceeded"
  | "rate_limited"
  | "schedule_limit_exceeded"
  | "subscription_required";

/** Status codes `/api/v1` uses for the error envelope. `408` is a timeout and may have no JSON body. */
export type RelayErrorStatus = 400 | 401 | 402 | 403 | 404 | 409 | 429 | 500;
