import type { ChatMessage } from "./types.js";
import { formatTime } from "./helpers.js";

export interface MessageListProps {
  messages: readonly ChatMessage[];
  /** Whether the bot is currently composing a reply. */
  pending?: boolean;
}

/** Renders the scrollable list of user/bot message bubbles. */
export function MessageList({ messages, pending = false }: MessageListProps) {
  return (
    <div className="cw-messages" role="log" aria-live="polite" data-testid="cw-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`cw-bubble cw-bubble--${message.role}`}
          data-role={message.role}
          data-testid="cw-bubble"
        >
          <span className="cw-bubble__text">{message.text}</span>
          <time className="cw-bubble__time" dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
        </div>
      ))}
      {pending ? (
        <div className="cw-bubble cw-bubble--bot cw-bubble--pending" data-testid="cw-pending">
          <span className="cw-bubble__text">…</span>
        </div>
      ) : null}
    </div>
  );
}
