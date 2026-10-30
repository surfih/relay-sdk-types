/** JSON value accepted in an event payload and returned in result fields. */
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

/** RFC 3339 timestamp, as the API writes it (`2026-10-28T17:51:00Z`). */
export type Rfc3339 = string;
