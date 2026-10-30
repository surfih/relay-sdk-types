/**
 * Header names the public API reads and writes.
 * HTTP treats them as case-insensitive; the server matches these lowercase forms.
 */

/** Tenant API key (`ak_live_…`) on every `/api/v1` call and on webhook deliveries. */
export const API_KEY_HEADER = "x-api-key";

/**
 * Unix seconds when the request was signed. Must match the value in the signing string.
 * Accepted within ±{@link TIMESTAMP_SKEW_SECONDS} of the server clock.
 */
export const TIMESTAMP_HEADER = "x-timestamp";

/** Required on create queue, submit event, and post result. At most 200 characters. */
export const IDEMPOTENCY_KEY_HEADER = "idempotency-key";

/**
 * Signature of the request signing string (client → relay) or of `api_key.body` (relay → webhook).
 * Prefix selects the algorithm: `sha256=<hex>` or `ed25519=<base64>`.
 */
export const PAYLOAD_SIGNATURE_HEADER = "x-payload-signature";

export const CONTENT_TYPE_HEADER = "content-type";

/** Set on every response by the server. */
export const REQUEST_ID_HEADER = "x-request-id";

/** Seconds to wait, set on `429 Too many requests`. */
export const RETRY_AFTER_HEADER = "retry-after";

/** Present on every webhook delivery from the relay. */
export const EVENT_ID_HEADER = "x-event-id";
export const EVENT_ATTEMPT_HEADER = "x-event-attempt";
export const QUEUE_ID_HEADER = "x-queue-id";

/** Extra headers when the queue uses `webhook_auth_mode: "ed25519"`. */
export const EVENT_TIMESTAMP_HEADER = "x-event-timestamp";
export const EVENT_KEY_ID_HEADER = "x-event-key-id";
export const EVENT_SIGNATURE_HEADER = "x-event-signature";

export const JSON_CONTENT_TYPE = "application/json";

/** Longest `Idempotency-Key` the server accepts, in characters. */
export const MAX_IDEMPOTENCY_KEY_LENGTH = 200;

/** Largest accepted gap between `X-Timestamp` and the server clock, either way. */
export const TIMESTAMP_SKEW_SECONDS = 300;

/**
 * Client → relay signing string (both HMAC and Ed25519):
 * `api_key + "." + timestamp + "." + METHOD + "." + path_and_query + "." + raw_body`
 */
export const REQUEST_SIGNING_STRING =
  "api_key.timestamp.METHOD.path_and_query.raw_body" as const;

/**
 * Relay → webhook HMAC input:
 * `api_key + "." + raw_body` (no timestamp / method / path).
 */
export const WEBHOOK_HMAC_SIGNING_STRING = "api_key.raw_body" as const;

/** Tenant API key for `X-API-Key`. */
export type ApiKey = `ak_live_${string}`;

/**
 * Tenant API secret. HMAC key for `sha256=` on `/api/v1` and on webhook deliveries.
 * Never sent on the wire.
 */
export type ApiSecret = `cs_live_${string}`;

/** @deprecated Use {@link ApiKey}. Kept as an alias for older call sites. */
export type CallbackApiKey = ApiKey;

/** Unix seconds as a decimal string — the same value that went into the signing string. */
export type TimestampSeconds = `${number}` | string;

/** Ed25519 signature: `ed25519=` plus standard base64 of the 64-byte signature. */
export type Ed25519PayloadSignature = `ed25519=${string}`;

/**
 * HMAC-SHA256, hex-encoded.
 * Client → relay: `HMAC(cs_live_, api_key.timestamp.METHOD.path.body)`.
 * Relay → webhook: `HMAC(cs_live_, api_key.body)`.
 */
export type HmacPayloadSignature = `sha256=${string}`;

/** Either signing method on `/api/v1`. The header prefix selects the verifier. */
export type PayloadSignature = Ed25519PayloadSignature | HmacPayloadSignature;

export type JsonContentTypeHeader = {
  "content-type": typeof JSON_CONTENT_TYPE;
};

/** Shared auth headers on every signed `/api/v1` call. */
export type SignedRequestHeaders = {
  "x-api-key": ApiKey;
  "x-timestamp": TimestampSeconds;
  "x-payload-signature": PayloadSignature;
};

/**
 * Reads (`GET`) and schedule delete (`DELETE`). Body is empty; still sign with `raw_body = ""`.
 */
export type ApiKeyHeaders = SignedRequestHeaders;

/**
 * Idempotent JSON write: create queue, submit event, or post a client result.
 * Sign the exact bytes you put in the body.
 */
export interface SignedIdempotentHeaders extends JsonContentTypeHeader, SignedRequestHeaders {
  "idempotency-key": string;
}

/**
 * JSON write without `Idempotency-Key`: create schedule, post checkpoints.
 * Sign the exact bytes you put in the body.
 */
export interface SignedBodyHeaders extends JsonContentTypeHeader, SignedRequestHeaders {}

/** `POST /api/v1/queues` — same shape as other idempotent writes. */
export type CreateQueueHeaders = SignedIdempotentHeaders;

/** Headers the server may set on a `/api/v1` response. */
export interface RelayResponseHeaders {
  "x-request-id"?: string;
  "content-type"?: string;
  "retry-after"?: string;
}

/** Always present on relay → webhook deliveries. */
export interface WebhookDeliveryHeaders extends JsonContentTypeHeader {
  "x-api-key": ApiKey;
  "x-payload-signature": HmacPayloadSignature;
  "idempotency-key": string;
  "x-event-id": string;
  "x-event-attempt": string;
  "x-queue-id": string;
}

/**
 * Extra headers when the queue was created with `webhook_auth_mode: "ed25519"`.
 * Signed message: `v1.{timestamp}.{event_id}.{sha256_hex(raw_body)}`.
 */
export interface WebhookEd25519DeliveryHeaders {
  "x-event-timestamp": TimestampSeconds;
  "x-event-key-id": string;
  "x-event-signature": Ed25519PayloadSignature;
}
