import type { ChatMessage } from "./types.js";
import { formatTime } from "./helpers.js";
import { Markdown } from "./Markdown.js";

export interface MessageListProps {
  messages: readonly ChatMessage[];
  /** Whether the bot is currently composing a reply (typing indicator). */
  pending?: boolean;
  /** Render message bodies as markdown. Defaults to `true`. */
  markdown?: boolean;
}

/** The animated three-dot typing indicator shown while the bot composes. */
export function TypingIndicator() {
  return (
    <div className="cw-bubble cw-bubble--bot cw-bubble--pending" data-testid="cw-pending">
      <span className="cw-typing" aria-label="Assistant is typing">
        <span className="cw-typing__dot" />
        <span className="cw-typing__dot" />
        <span className="cw-typing__dot" />
      </span>
    </div>
  );
}

/** Renders the scrollable list of user/bot message bubbles. */
export function MessageList({ messages, pending = false, markdown = true }: MessageListProps) {
  return (
    <div className="cw-messages" role="log" aria-live="polite" data-testid="cw-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`cw-bubble cw-bubble--${message.role}${
            message.status ? ` cw-bubble--${message.status}` : ""
          }`}
          data-role={message.role}
          data-status={message.status ?? "complete"}
          data-testid="cw-bubble"
        >
          <span className="cw-bubble__text">
            {markdown && message.role === "bot" ? (
              <Markdown source={message.text} />
            ) : (
              message.text
            )}
          </span>
          <time className="cw-bubble__time" dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
        </div>
      ))}
      {pending ? <TypingIndicator /> : null}
    </div>
  );
}
