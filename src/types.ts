/** Who authored a chat message. */
export type MessageRole = "user" | "bot";

/** A single chat message rendered in the widget. */
export interface ChatMessage {
  /** Stable unique identifier. */
  id: string;
  /** Author of the message. */
  role: MessageRole;
  /** Plain-text body. */
  text: string;
  /** Epoch milliseconds the message was created. */
  timestamp: number;
}

/**
 * Pluggable send handler. Receives the trimmed user text and resolves
 * with the bot's reply text.
 */
export type SendHandler = (text: string) => Promise<string>;
