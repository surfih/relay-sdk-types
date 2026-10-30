import type { JsonValue, Rfc3339 } from "./json.js";

/** Highest standard plan allowance. Read the current plan's `schedule_limit` or list response's `limit`. */
export const MAX_SCHEDULES_PER_CLIENT = 100;

/**
 * `POST /api/v1/queues/{queue_id}/schedules`.
 * Sign with `ak_live_` + `X-Timestamp` + either `sha256=` or `ed25519=`. No `Idempotency-Key`.
 * `event_type: "send_message"` still requires `event` to be only `{ notification_id }`.
 */
export interface CreateScheduleRequest<TEvent extends Exclude<JsonValue, null> = Exclude<JsonValue, null>> {
  /** 1–120 characters, trimmed. Unique per client. */
  name: string;
  /** 5-field cron expression, 1–120 characters, trimmed. Must have a future fire time. */
  cron: string;
  /** IANA name, 1–64 characters. Defaults to `"UTC"`. */
  timezone?: string;
  /** 1–200 characters. Not trimmed. */
  event_type: string;
  /** Required; JSON `null` is rejected. */
  event: TEvent;
  /**
   * Accepted on create but not stored — the row always starts `enabled: true`.
   * Use the admin schedule API to pause later.
   */
  enabled?: boolean;
}

export interface Schedule {
  id: string;
  queue_id: string;
  queue_name: string;
  name: string;
  cron: string;
  timezone: string;
  event_type: string;
  event: JsonValue;
  enabled: boolean;
  next_run_at: Rfc3339;
  last_run_at: Rfc3339 | null;
  last_event_id: string | null;
  last_error: string | null;
  created_at: Rfc3339;
  updated_at: Rfc3339;
}

/** `201 Created`. */
export interface ScheduleResponse {
  schedule: Schedule;
}

/** `GET /api/v1/queues/{queue_id}/schedules`. */
export interface ScheduleListResponse {
  schedules: Schedule[];
  /** Current plan allowance across every queue. */
  limit: number;
}

/** `DELETE /api/v1/schedules/{schedule_id}`. */
export interface DeletedScheduleResponse {
  deleted: true;
}
