import type { ApiKeyHeaders, CreateQueueHeaders, SignedBodyHeaders, SignedIdempotentHeaders } from "./headers.js";
import type { CreateQueueRequest, CreateQueueResponse } from "./queues.js";
import type {
  AcceptedEventResponse,
  Event,
  EventResultResponse,
  EventWithAttempts,
  GetEventQuery,
  PostCheckpointsRequest,
  PostCheckpointsResponse,
  PostEventResultRequest,
  SubmitEventRequest,
} from "./events.js";
import type { CreateScheduleRequest, DeletedScheduleResponse, ScheduleListResponse, ScheduleResponse } from "./schedules.js";

/** One call a client can make on `/api/v1`. `body` and `query` are `undefined` when the call has neither. */
export interface RelayOperation<
  TMethod extends "GET" | "POST" | "DELETE",
  THeaders,
  TBody,
  TResponse,
  TStatus extends number,
  TQuery = undefined,
> {
  method: TMethod;
  headers: THeaders;
  query: TQuery;
  body: TBody;
  response: TResponse;
  /** HTTP status of a successful call. Errors use the shared `{ error }` envelope. */
  successStatus: TStatus;
}

export interface RelayApi {
  /** `POST /api/v1/queues` */
  createQueue: RelayOperation<"POST", CreateQueueHeaders, CreateQueueRequest, CreateQueueResponse, 200 | 201>;
  /** `POST /api/v1/queues/{queueId}/events` */
  submitEvent: RelayOperation<"POST", SignedIdempotentHeaders, SubmitEventRequest, AcceptedEventResponse, 202>;
  /** `GET /api/v1/events/{eventId}` */
  getEvent: RelayOperation<"GET", ApiKeyHeaders, undefined, Event, 200, GetEventQuery>;
  /** `GET /api/v1/events/{eventId}?attempts=1` */
  getEventWithAttempts: RelayOperation<"GET", ApiKeyHeaders, undefined, EventWithAttempts, 200, { attempts: "1" }>;
  /** `POST /api/v1/events/{eventId}/result` */
  postEventResult: RelayOperation<"POST", SignedIdempotentHeaders, PostEventResultRequest, EventResultResponse, 200>;
  /** `POST /api/v1/events/{eventId}/checkpoints` */
  postCheckpoints: RelayOperation<"POST", SignedBodyHeaders, PostCheckpointsRequest, PostCheckpointsResponse, 200>;
  /** `GET /api/v1/queues/{queueId}/schedules` */
  listSchedules: RelayOperation<"GET", ApiKeyHeaders, undefined, ScheduleListResponse, 200>;
  /** `POST /api/v1/queues/{queueId}/schedules` */
  createSchedule: RelayOperation<"POST", SignedBodyHeaders, CreateScheduleRequest, ScheduleResponse, 201>;
  /** `DELETE /api/v1/schedules/{scheduleId}` */
  deleteSchedule: RelayOperation<"DELETE", ApiKeyHeaders, undefined, DeletedScheduleResponse, 200>;
}

export type RelayOperationName = keyof RelayApi;

/** Path builders. Identifiers are percent-encoded. */
export const paths = {
  createQueue: "/api/v1/queues",
  submitEvent: (queueId: string): string => `/api/v1/queues/${encodeURIComponent(queueId)}/events`,
  getEvent: (eventId: string): string => `/api/v1/events/${encodeURIComponent(eventId)}`,
  postEventResult: (eventId: string): string => `/api/v1/events/${encodeURIComponent(eventId)}/result`,
  postCheckpoints: (eventId: string): string => `/api/v1/events/${encodeURIComponent(eventId)}/checkpoints`,
  listSchedules: (queueId: string): string => `/api/v1/queues/${encodeURIComponent(queueId)}/schedules`,
  createSchedule: (queueId: string): string => `/api/v1/queues/${encodeURIComponent(queueId)}/schedules`,
  deleteSchedule: (scheduleId: string): string => `/api/v1/schedules/${encodeURIComponent(scheduleId)}`,
} as const;
