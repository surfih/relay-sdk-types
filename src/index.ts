/**
 * Types for calling the Relay public API (`/api/v1`).
 *
 * Every call uses the tenant `ak_live_` key plus `X-Timestamp` and `X-Payload-Signature`.
 * Sign `api_key.timestamp.METHOD.path_and_query.raw_body` with either HMAC (`sha256=` /
 * `cs_live_`) or Ed25519 (`ed25519=` / queue request private key or KMS). Sign the bytes you
 * send; do not re-serialize after signing.
 */

export type { JsonObject, JsonPrimitive, JsonValue, Rfc3339 } from "./json.js";

export {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  EVENT_ATTEMPT_HEADER,
  EVENT_ID_HEADER,
  EVENT_KEY_ID_HEADER,
  EVENT_SIGNATURE_HEADER,
  EVENT_TIMESTAMP_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  JSON_CONTENT_TYPE,
  MAX_IDEMPOTENCY_KEY_LENGTH,
  PAYLOAD_SIGNATURE_HEADER,
  QUEUE_ID_HEADER,
  REQUEST_ID_HEADER,
  REQUEST_SIGNING_STRING,
  RETRY_AFTER_HEADER,
  TIMESTAMP_HEADER,
  TIMESTAMP_SKEW_SECONDS,
  WEBHOOK_HMAC_SIGNING_STRING,
} from "./headers.js";
export type {
  ApiKey,
  ApiKeyHeaders,
  ApiSecret,
  CallbackApiKey,
  CreateQueueHeaders,
  Ed25519PayloadSignature,
  HmacPayloadSignature,
  JsonContentTypeHeader,
  PayloadSignature,
  RelayResponseHeaders,
  SignedBodyHeaders,
  SignedIdempotentHeaders,
  SignedRequestHeaders,
  TimestampSeconds,
  WebhookDeliveryHeaders,
  WebhookEd25519DeliveryHeaders,
} from "./headers.js";

export type {
  ApiErrorObject,
  ApiErrorResponse,
  EventQuotaExceededResponse,
  IdempotencyConflictResponse,
  RateLimitResponse,
  RelayErrorCode,
  RelayErrorStatus,
  ScheduleLimitExceededResponse,
  SubscriptionRequiredResponse,
  ValidationErrorResponse,
  ValidationIssue,
} from "./errors.js";

export { DEFAULT_QUEUE_RULES } from "./queues.js";
export type { CreateQueueRequest, CreateQueueResponse, Queue, QueueRules, WebhookAuthMode } from "./queues.js";

export {
  CLIENT_STATUSES,
  KEY_MODES,
  MAX_BATCH_SUBMISSIONS,
  MAX_CHECKPOINT_BATCH,
  MAX_CHECKPOINTS_PER_EVENT,
  MAX_DELAY_SECONDS,
  MAX_DELIVERY_DELAY_DAYS,
  SERVER_STATUSES,
} from "./events.js";
export type {
  AcceptedEventResponse,
  BatchSubmission,
  Checkpoint,
  CheckpointInput,
  ClientResultError,
  ClientStatus,
  CodedError,
  DeliveryAttempt,
  DeliveryTiming,
  Event,
  EventResultResponse,
  EventWithAttempts,
  GetEventQuery,
  GetEventResponse,
  KeyMode,
  PostCheckpointsRequest,
  PostCheckpointsResponse,
  PostEventResultRequest,
  SendMessageEvent,
  ServerStatus,
  SubmitEventRequest,
  SubmitSendMessageRequest,
  WebhookDeliveryBody,
} from "./events.js";

export { MAX_SCHEDULES_PER_CLIENT } from "./schedules.js";
export type {
  CreateScheduleRequest,
  DeletedScheduleResponse,
  Schedule,
  ScheduleListResponse,
  ScheduleResponse,
} from "./schedules.js";

export { paths } from "./endpoints.js";
export type { RelayApi, RelayOperation, RelayOperationName } from "./endpoints.js";
