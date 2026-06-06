/** Who authored a chat message. */
export type MessageRole = "user" | "bot";

/** Delivery/streaming status of a message. */
export type MessageStatus = "sending" | "streaming" | "complete" | "error";

/**
 * A single quick-reply suggestion rendered as a tappable button beneath
 * the conversation. Selecting one submits its `value` as if the user had
 * typed it.
 */
export interface QuickReply {
  /** Stable unique identifier. */
  id: string;
  /** Visible button label. */
  label: string;
  /** Text submitted when the chip is selected. Defaults to `label`. */
  value?: string;
}

/** A single chat message rendered in the widget. */
export interface ChatMessage {
  /** Stable unique identifier. */
  id: string;
  /** Author of the message. */
  role: MessageRole;
  /** Plain-text (or markdown) body. */
  text: string;
  /** Epoch milliseconds the message was created. */
  timestamp: number;
  /** Delivery status. Absent is treated as `"complete"`. */
  status?: MessageStatus;
  /** Quick-reply chips attached to a bot message. */
  quickReplies?: readonly QuickReply[];
}

/**
 * Pluggable send handler. Receives the trimmed user text and resolves
 * with the bot's reply text. Use this for simple request/response bots.
 */
export type SendHandler = (text: string) => Promise<string>;

/**
 * Pluggable streaming handler. Receives the trimmed user text and yields
 * chunks of the bot's reply as they arrive. The widget concatenates the
 * chunks and renders them live. Use this for token-by-token LLM streams.
 */
export type StreamHandler = (text: string) => AsyncIterable<string>;

/**
 * Pluggable persistence layer for the conversation transcript. All
 * methods may be async; the widget awaits them. Implement this to back
 * the widget with `localStorage`, IndexedDB, a server, etc.
 */
export interface MessageStore {
  /** Load the persisted transcript. Returns `[]` when nothing is stored. */
  load(): Promise<ChatMessage[]> | ChatMessage[];
  /** Persist the full transcript, replacing any prior state. */
  save(messages: readonly ChatMessage[]): Promise<void> | void;
  /** Remove all persisted messages. */
  clear(): Promise<void> | void;
}
