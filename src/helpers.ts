import type { ChatMessage, MessageRole, MessageStatus } from "./types.js";

let counter = 0;

/**
 * Generate a reasonably unique message id. Combines a monotonically
 * increasing counter with the current time so ids stay ordered and
 * collision-free within a session.
 */
export function createMessageId(): string {
  counter += 1;
  return `msg_${Date.now().toString(36)}_${counter.toString(36)}`;
}

/**
 * Append a new message to an existing list, returning a fresh array
 * (the input list is never mutated). Empty/whitespace-only text is
 * preserved as-is here; callers decide whether to send.
 */
export function appendMessage(
  messages: readonly ChatMessage[],
  role: MessageRole,
  text: string,
  timestamp: number = Date.now(),
  extra: Partial<Pick<ChatMessage, "status" | "quickReplies">> = {},
): ChatMessage[] {
  const message: ChatMessage = {
    id: createMessageId(),
    role,
    text,
    timestamp,
    ...extra,
  };
  return [...messages, message];
}

/**
 * Return a new list with the message matching `id` shallow-merged with
 * `patch`. The input list and all other messages are left untouched. Used
 * to grow a streaming bot reply in place.
 */
export function updateMessage(
  messages: readonly ChatMessage[],
  id: string,
  patch: Partial<Omit<ChatMessage, "id">>,
): ChatMessage[] {
  return messages.map((message) =>
    message.id === id ? { ...message, ...patch } : message,
  );
}

/**
 * Count messages that should contribute to the unread badge: bot messages
 * created at or after `since` (the moment the panel was last opened).
 * Pending/error placeholders are ignored.
 */
export function countUnread(
  messages: readonly ChatMessage[],
  since: number,
): number {
  return messages.filter(
    (m) =>
      m.role === "bot" &&
      m.timestamp >= since &&
      m.status !== "sending" &&
      m.status !== "streaming",
  ).length;
}

/** True when a status represents an in-flight (not yet settled) message. */
export function isInFlight(status: MessageStatus | undefined): boolean {
  return status === "sending" || status === "streaming";
}

/**
 * Format an epoch-millisecond timestamp as a zero-padded 24-hour
 * "HH:MM" string (local time). Deterministic and locale-independent.
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** True when the text has at least one non-whitespace character. */
export function isSendable(text: string): boolean {
  return text.trim().length > 0;
}
