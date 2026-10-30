import type { Rfc3339 } from "./json.js";

/** How the relay signs the webhook delivery. Omitted on create means `"none"`. */
export type WebhookAuthMode = "none" | "ed25519";

/**
 * Delivery policy stored on the queue and snapshotted onto each event.
 * `POST /api/v1/queues` always stores the defaults; the dashboard can replace them later.
 */
export interface QueueRules {
  /** 1–32. Default 8. */
  max_attempts: number;
  /** 1–16 integers, each 1–86400 seconds. Default `[5, 15, 60, 300]`. */
  retry_backoff_seconds: number[];
  /** 5–300. Must be at least `delivery_timeout_seconds + 5`. Default 30. */
  lease_seconds: number;
  /** 1–120. Default 10. */
  delivery_timeout_seconds: number;
  /** 60–604800. Default 86400. */
  client_result_timeout_seconds: number;
  /** 1–20 HTTP statuses, each 100–599. Default `[200, 202, 204]`. */
  accepted_http_statuses: number[];
}

export const DEFAULT_QUEUE_RULES: QueueRules = {
  max_attempts: 8,
  retry_backoff_seconds: [5, 15, 60, 300],
  lease_seconds: 30,
  delivery_timeout_seconds: 10,
  client_result_timeout_seconds: 86_400,
  accepted_http_statuses: [200, 202, 204],
};

/**
 * `POST /api/v1/queues` body.
 * Authenticated with `ak_live_` plus `X-Timestamp` and either `sha256=` or `ed25519=`.
 */
export interface CreateQueueRequest {
  /** 1–120 characters. Not trimmed. */
  name: string;
  /** Absolute URL, 1–2048 characters. */
  webhook_url: string;
  /**
   * SubjectPublicKeyInfo PEM of the Ed25519 key that will sign later `ed25519=` requests
   * on this queue. Optional; 1–4096 characters. Required before the first `ed25519=` call
   * against the queue.
   */
  request_public_key_pem?: string;
  webhook_auth_mode?: WebhookAuthMode;
}

/** Queue object returned by create (and embedded in other views that reuse this shape). */
export interface Queue {
  id: string;
  client_id: string;
  name: string;
  webhook_url: string;
  webhook_auth_mode: WebhookAuthMode | string;
  webhook_key_id: string | null;
  webhook_signature_version: string | null;
  request_public_key_pem: string | null;
  enabled: boolean;
  rules: QueueRules;
  rules_version: number;
  created_at: Rfc3339;
  updated_at: Rfc3339;
}

/**
 * `200` when the name or the same idempotency key already exists (`created: false`).
 * `201` when the queue was inserted (`created: true`).
 */
export interface CreateQueueResponse {
  created: boolean;
  queue: Queue;
}
