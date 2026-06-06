import { useCallback, useState } from "react";
import type { ChatMessage, SendHandler } from "./types.js";
import { appendMessage } from "./helpers.js";
import { MessageList } from "./MessageList.js";
import { ChatInput } from "./ChatInput.js";

export interface ChatWidgetProps {
  /** Pluggable handler: receives user text, resolves with the bot reply. */
  onSend: SendHandler;
  /** Header title shown at the top of the panel. */
  title?: string;
  /** Whether the panel starts open. Defaults to closed. */
  defaultOpen?: boolean;
  /** Optional seed messages (e.g. a greeting). */
  initialMessages?: readonly ChatMessage[];
  /** Placeholder text for the input field. */
  placeholder?: string;
}

/**
 * Embeddable chatbot widget: a floating launcher button that toggles a
 * panel containing a message list and an input. Sending a message calls
 * `onSend` and appends the resolved bot reply.
 */
export function ChatWidget({
  onSend,
  title = "Chat with us",
  defaultOpen = false,
  initialMessages = [],
  placeholder,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const [pending, setPending] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleSubmit = useCallback(
    async (text: string) => {
      setMessages((prev) => appendMessage(prev, "user", text));
      setPending(true);
      try {
        const reply = await onSend(text);
        setMessages((prev) => appendMessage(prev, "bot", reply));
      } catch {
        setMessages((prev) =>
          appendMessage(prev, "bot", "Sorry, something went wrong. Please try again."),
        );
      } finally {
        setPending(false);
      }
    },
    [onSend],
  );

  return (
    <div className="cw-root" data-testid="cw-root">
      {open ? (
        <section className="cw-panel" role="dialog" aria-label={title} data-testid="cw-panel">
          <header className="cw-panel__header">
            <h2 className="cw-panel__title">{title}</h2>
            <button
              type="button"
              className="cw-panel__close"
              aria-label="Close chat"
              data-testid="cw-close-button"
              onClick={toggle}
            >
              ×
            </button>
          </header>
          <MessageList messages={messages} pending={pending} />
          <ChatInput onSubmit={handleSubmit} disabled={pending} placeholder={placeholder} />
        </section>
      ) : null}
      <button
        type="button"
        className="cw-launcher"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        data-testid="cw-launcher"
        onClick={toggle}
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}
