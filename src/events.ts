import type { JsonValue, Rfc3339 } from "./json.js";

/** Server-side delivery state. */
export type ServerStatus =
  | "idle"
  | "reserved"
  | "processing"
  | "sent"
  | "timeout"
  | "delivery_error"
  | "cancelled";

export const SERVER_STATUSES = [
  "idle",
  "reserved",
  "processing",
  "sent",
  "timeout",
  "delivery_error",
  "cancelled",
] as const satisfies readonly ServerStatus[];

/** Business outcome posted to `POST /api/v1/events/{event_id}/result`. */
export type ClientStatus = "completed" | "error" | "custom";

export const CLIENT_STATUSES = ["completed", "error", "custom"] as const satisfies readonly ClientStatus[];

/** Furthest `deliver_at` / `delay_seconds` the server accepts. */
export const MAX_DELIVERY_DELAY_DAYS = 90;

/** `90 * 24 * 60 * 60`. Inclusive upper bound for `delay_seconds`. */
export const MAX_DELAY_SECONDS = 7_776_000;

/**
 * How `Idempotency-Key` is reused on `POST …/events`.
 * - `once` (default): forever unique; same body replays, different body conflicts
 * - `throttle`: while open, same as once; after closed, a new `event_id` is created
 * - `debounce`: while idle, replace payload and reschedule; after closed, new `event_id`
 * - `batch`: while idle, append payloads into `submissions` and reschedule; webhook receives all
 */
export type KeyMode = "once" | "throttle" | "debounce" | "batch";

export const KEY_MODES = ["once", "throttle", "debounce", "batch"] as const satisfies readonly KeyMode[];

/** Cap on accumulated payloads for an open `key_mode: "batch"` event. */
export const MAX_BATCH_SUBMISSIONS = 100;

type DeliverImmediately = {
  deliver_at?: never;
  delay_seconds?: never;
};

type DeliverAt = {
  /** RFC 3339. A time in the past is delivered immediately. At most 90 days ahead. */
  deliver_at: Rfc3339;
  delay_seconds?: never;
};

type DelaySeconds = {
  deliver_at?: never;
  /** Integer seconds from 0 through {@link MAX_DELAY_SECONDS}. */
  delay_seconds: number;
};

/** Send one of these, never both. Omit both to deliver as soon as a worker is free. */
export type DeliveryTiming = DeliverImmediately | DeliverAt | DelaySeconds;

/** `POST /api/v1/queues/{queue_id}/events`. */
export type SubmitEventRequest<TEvent extends JsonValue = JsonValue> = {
  /** 1–200 characters. Not trimmed. */
  event_type: string;
  /** Omitted or JSON `null` is stored as `null`. */
  event?: TEvent;
  /** Defaults to `once` on the server when omitted. */
  key_mode?: KeyMode;
} & DeliveryTiming;

/**
 * `event_type: "send_message"` may contain only `notification_id` (1–200 characters).
 * Any other key is rejected.
 */
export interface SendMessageEvent {
  notification_id: string;
}

export type SubmitSendMessageRequest = {
  event_type: "send_message";
  event: SendMessageEvent;
  /** Defaults to `once` on the server when omitted. */
  key_mode?: KeyMode;
} & DeliveryTiming;

/**
 * `202 Accepted` for a new event and for an idempotent replay of the same body.
 * A replay returns the stored row, so `server_status` may already have moved on.
 */
export interface AcceptedEventResponse {
  event_id: string;
  server_status: ServerStatus;
  client_status: ClientStatus | null;
  /** `null` when the event was not delayed. */
  deliver_at: Rfc3339 | null;
}

/** `code` / `message` pair. Missing keys are JSON `null`. */
export interface CodedError {
  code: string | null;
  message: string | null;
}

/** One webhook delivery, included only when `GET` is called with `attempts=1`. */
export interface DeliveryAttempt {
  attempt_number: number;
  started_at: Rfc3339;
  finished_at: Rfc3339 | null;
  duration_ms: number | null;
  http_status: number | null;
  response_summary: string | null;
  error_code: string | null;
  error_message: string | null;
}

/**
 * A tagged moment reported by the webhook, included with `attempts` when `GET` is called with
 * `attempts=1`. Both times are UTC. `at` is the webhook's clock and `received_at` the relay's,
 * so `at > received_at` means the webhook clock runs ahead.
 */
export interface Checkpoint {
  tag: string;
  at: Rfc3339;
  received_at: Rfc3339;
  /** Latest attempt that had started by `at`; `null` if none. */
  attempt_number: number | null;
}

/** `GET /api/v1/events/{event_id}`. */
export interface GetEventQuery {
  /** The string `"1"` includes `attempts` and `checkpoints`. Any other value omits them. */
  attempts?: "1";
}

/** One payload accepted while a `key_mode: "batch"` event was idle. */
export interface BatchSubmission<TEvent extends JsonValue = JsonValue> {
  event: TEvent;
  submitted_at: Rfc3339;
}

/** Tenant-visible event. Worker id, lease token, and internal error detail are omitted. */
export interface Event {
  event_id: string;
  queue_id: string;
  event_type: string;
  event: JsonValue;
  key_mode: KeyMode;
  /** Accumulated payloads for `batch`; `null` for other modes. */
  submissions: BatchSubmission[] | null;
  server_status: ServerStatus;
  client_status: ClientStatus | null;
  attempt_count: number;
  delivery_exhausted: boolean;
  server_result: JsonValue;
  server_error: CodedError | null;
  client_result: JsonValue;
  client_error: JsonValue;
  result_deadline_at: Rfc3339 | null;
  result_timed_out_at: Rfc3339 | null;
  created_at: Rfc3339;
  updated_at: Rfc3339;
  sent_at: Rfc3339 | null;
  finished_at: Rfc3339 | null;
  deliver_at: Rfc3339 | null;
}

export interface EventWithAttempts extends Event {
  attempts: DeliveryAttempt[];
  /** Ordered by `at`. */
  checkpoints: Checkpoint[];
}

export type GetEventResponse<WithAttempts extends boolean = false> = WithAttempts extends true
  ? EventWithAttempts
  : Event;

export interface ClientResultError {
  code: string;
  message: string;
}

/**
 * `POST /api/v1/events/{event_id}/result`.
 * The event must be `server_status: "sent"` and not already finished with a different body.
 */
export type PostEventResultRequest =
  | {
      status: "completed" | "custom";
      /** Omitted and JSON `null` are stored as no result. */
      result?: JsonValue;
      error?: never;
    }
  | {
      status: "error";
      result?: never;
      /** Only `code` and `message` are kept. Both are required and non-empty. */
      error: ClientResultError;
    };

/** `200`. `replay` is true when this body was already stored under the same idempotency key. */
export interface EventResultResponse extends Event {
  replay: boolean;
}

/** Checkpoints per request, and in total per event. */
export const MAX_CHECKPOINT_BATCH = 20;
export const MAX_CHECKPOINTS_PER_EVENT = 100;

export interface CheckpointInput {
  /** 1–64 characters of `a-z`, `0-9`, `_ . : -`. */
  tag: string;
  /**
   * RFC 3339 with an explicit offset (`Z` recommended, e.g. `new Date().toISOString()`).
   * Stored and returned as UTC. Omitted means the time the relay received it. Must fall between
   * one minute before the event was created and one minute after the relay's clock.
   */
  at?: Rfc3339;
}

/**
 * `POST /api/v1/events/{event_id}/checkpoints`.
 * Accepted from the first delivery attempt until 10 minutes after the event closes. A checkpoint
 * with the same `tag` and `at` as a stored one is ignored, so retries are safe.
 */
export interface PostCheckpointsRequest {
  /** 1 to {@link MAX_CHECKPOINT_BATCH} items. */
  checkpoints: CheckpointInput[];
}

/** `200`. `accepted` counts newly stored checkpoints; `checkpoints` lists all of the event's. */
export interface PostCheckpointsResponse {
  accepted: number;
  checkpoints: Checkpoint[];
}

/**
 * Body the relay `POST`s to the queue `webhook_url`.
 * HTTP 2xx only means delivery accepted; report the business outcome via {@link PostEventResultRequest}.
 */
export interface WebhookDeliveryBody<TEvent extends JsonValue = JsonValue> {
  event_id: string;
  queue_id: string;
  event_type: string;
  event: TEvent;
  /**
   * Present only when the event was submitted with `key_mode: "batch"`.
   * Latest payload is also mirrored in `event`.
   */
  submissions?: BatchSubmission<TEvent>[];
  attempt: number;
  created_at: Rfc3339;
}
