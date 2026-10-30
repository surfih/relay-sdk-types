import type { CreateQueueHeaders, SignedBodyHeaders, SignedIdempotentHeaders } from "./headers.js";
import type { CreateQueueRequest } from "./queues.js";
import type {
  PostCheckpointsRequest,
  PostEventResultRequest,
  SubmitEventRequest,
  SubmitSendMessageRequest,
} from "./events.js";
import type { RelayApi } from "./endpoints.js";

const queueBody = {
  name: "messages",
  webhook_url: "https://example.com/send_message",
  request_public_key_pem: "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA\n-----END PUBLIC KEY-----\n",
} satisfies CreateQueueRequest;

const queueBodyWithoutKey = {
  name: "messages",
  webhook_url: "https://example.com/send_message",
} satisfies CreateQueueRequest;

const queueHeaders = {
  "content-type": "application/json",
  "x-api-key": "ak_live_example",
  "x-timestamp": "1730112000",
  "idempotency-key": "messages",
  "x-payload-signature": "sha256=abcd",
} satisfies CreateQueueHeaders;

const immediate = {
  event_type: "order.created",
  event: { id: "ord_1" },
} satisfies SubmitEventRequest;

const delayed = {
  event_type: "send_message",
  event: { notification_id: "ntf_1" },
  delay_seconds: 30,
} satisfies SubmitSendMessageRequest;

const atTime = {
  event_type: "send_message",
  event: { notification_id: "ntf_2" },
  deliver_at: "2026-10-28T18:00:00Z",
} satisfies SubmitSendMessageRequest;

const both = {
  event_type: "send_message",
  event: { notification_id: "ntf_3" },
  deliver_at: "2026-10-28T18:00:00Z",
  delay_seconds: 30,
  // @ts-expect-error deliver_at and delay_seconds are mutually exclusive
} satisfies SubmitSendMessageRequest;

const completed = {
  status: "completed",
  result: { provider_id: "msg_1" },
} satisfies PostEventResultRequest;

const failed = {
  status: "error",
  error: { code: "rejected", message: "mailbox full" },
} satisfies PostEventResultRequest;

const missingError = {
  status: "error",
  // @ts-expect-error an error result requires error.code and error.message
} satisfies PostEventResultRequest;

const eventHeaders = {
  "content-type": "application/json",
  "x-api-key": "ak_live_example",
  "x-timestamp": "1730112000",
  "idempotency-key": "ntf_1",
  "x-payload-signature": "ed25519=AAAA",
} satisfies SignedIdempotentHeaders;

const checkpointBody = {
  checkpoints: [{ tag: "received", at: "2026-10-29T10:00:00.120Z" }, { tag: "done" }],
} satisfies PostCheckpointsRequest;

const checkpointHeaders = {
  "content-type": "application/json",
  "x-api-key": "ak_live_example",
  "x-timestamp": "1730112000",
  "x-payload-signature": "sha256=abcd",
} satisfies SignedBodyHeaders;

type _Submit = RelayApi["submitEvent"];
type _SubmitStatus = _Submit["successStatus"];
const _status: _SubmitStatus = 202;

type _Checkpoints = RelayApi["postCheckpoints"];
type _CheckpointsStatus = _Checkpoints["successStatus"];
const _checkpointsStatus: _CheckpointsStatus = 200;

void queueBody;
void queueBodyWithoutKey;
void queueHeaders;
void immediate;
void delayed;
void atTime;
void both;
void completed;
void failed;
void missingError;
void eventHeaders;
void checkpointBody;
void checkpointHeaders;
void _status;
void _checkpointsStatus;
