import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, MessageStore, QuickReply, SendHandler, StreamHandler } from "./types.js";
import { appendMessage, countUnread, updateMessage } from "./helpers.js";
import { MessageList } from "./MessageList.js";
import { ChatInput } from "./ChatInput.js";
import { QuickReplies } from "./QuickReplies.js";
import { collectStream, toStreamHandler } from "./streaming.js";
import { themeToCssVars, type ChatTheme } from "./theme.js";

export interface ChatWidgetProps {
  /**
   * Request/response handler: receives user text, resolves with the bot
   * reply. Provide either this or {@link ChatWidgetProps.onStream}.
   */
  onSend?: SendHandler;
  /**
   * Streaming handler: receives user text, yields reply chunks that are
   * rendered live. Takes precedence over `onSend` when both are given.
   */
  onStream?: StreamHandler;
  /** Header title shown at the top of the panel. */
  title?: string;
  /** Whether the panel starts open. Defaults to closed. */
  defaultOpen?: boolean;
  /** Optional seed messages (e.g. a greeting). Ignored if a store loads state. */
  initialMessages?: readonly ChatMessage[];
  /** Quick-reply chips shown beneath the conversation initially. */
  initialQuickReplies?: readonly QuickReply[];
  /** Placeholder text for the input field. */
  placeholder?: string;
  /** Pluggable persistence for the transcript. */
  store?: MessageStore;
  /** Visual theme overrides. */
  theme?: ChatTheme;
  /** Render bot bodies as markdown. Defaults to `true`. */
  markdown?: boolean;
  /** Notified whenever the unread badge count changes. */
  onUnreadChange?: (count: number) => void;
}

/**
 * Embeddable chatbot widget: a floating launcher that toggles a panel with
 * a live message list, input, quick replies, typing indicator, unread
 * badge, theming, and pluggable persistence + streaming.
 */
export function ChatWidget({
  onSend,
  onStream,
  title = "Chat with us",
  defaultOpen = false,
  initialMessages = [],
  initialQuickReplies = [],
  placeholder,
  store,
  theme,
  markdown = true,
  onUnreadChange,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const [pending, setPending] = useState(false);
  const [quickReplies, setQuickReplies] = useState<readonly QuickReply[]>(initialQuickReplies);
  const [unread, setUnread] = useState(0);

  // Timestamp marking when the user last saw the conversation.
  const lastSeenRef = useRef<number>(defaultOpen ? Date.now() : 0);

  // Resolve the effective streaming handler once per relevant prop change.
  const stream = useMemo<StreamHandler | null>(() => {
    if (onStream) {
      return onStream;
    }
    if (onSend) {
      return toStreamHandler(onSend);
    }
    return null;
  }, [onStream, onSend]);

  // Load persisted transcript on mount when a store is supplied.
  useEffect(() => {
    if (!store) {
      return;
    }
    let cancelled = false;
    void Promise.resolve(store.load()).then((loaded) => {
      if (!cancelled && loaded.length > 0) {
        setMessages(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  // Persist whenever the transcript changes (skipping the in-flight states).
  useEffect(() => {
    if (!store) {
      return;
    }
    void Promise.resolve(store.save(messages));
  }, [store, messages]);

  // Recompute the unread badge whenever messages change while closed.
  useEffect(() => {
    const count = open ? 0 : countUnread(messages, lastSeenRef.current);
    setUnread(count);
    onUnreadChange?.(count);
  }, [messages, open, onUnreadChange]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        lastSeenRef.current = Date.now();
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!stream) {
        return;
      }
      setQuickReplies([]);
      setMessages((prev) => appendMessage(prev, "user", text, Date.now(), { status: "complete" }));
      setPending(true);

      // Insert a placeholder bot message we grow as chunks arrive.
      let botId = "";
      setMessages((prev) => {
        const next = appendMessage(prev, "bot", "", Date.now(), { status: "streaming" });
        botId = next[next.length - 1]!.id;
        return next;
      });

      try {
        const reply = await collectStream(stream(text), (accumulated) => {
          setMessages((prev) => updateMessage(prev, botId, { text: accumulated }));
        });
        setMessages((prev) =>
          updateMessage(prev, botId, { text: reply, status: "complete" }),
        );
      } catch {
        setMessages((prev) =>
          updateMessage(prev, botId, {
            text: "Sorry, something went wrong. Please try again.",
            status: "error",
          }),
        );
      } finally {
        setPending(false);
      }
    },
    [stream],
  );

  const handleQuickReply = useCallback(
    (value: string) => {
      void handleSubmit(value);
    },
    [handleSubmit],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setQuickReplies(initialQuickReplies);
    if (store) {
      void Promise.resolve(store.clear());
    }
  }, [store, initialQuickReplies]);

  return (
    <div className="cw-root" data-testid="cw-root" style={themeToCssVars(theme)}>
      {open ? (
        <section className="cw-panel" role="dialog" aria-label={title} data-testid="cw-panel">
          <header className="cw-panel__header">
            <h2 className="cw-panel__title">{title}</h2>
            <div className="cw-panel__actions">
              <button
                type="button"
                className="cw-panel__clear"
                aria-label="Clear conversation"
                data-testid="cw-clear-button"
                onClick={clearHistory}
              >
                Clear
              </button>
              <button
                type="button"
                className="cw-panel__close"
                aria-label="Close chat"
                data-testid="cw-close-button"
                onClick={toggle}
              >
                {"×"}
              </button>
            </div>
          </header>
          <MessageList messages={messages} pending={pending} markdown={markdown} />
          <QuickReplies replies={quickReplies} onSelect={handleQuickReply} disabled={pending} />
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
        {!open && unread > 0 ? (
          <span className="cw-launcher__badge" aria-label={`${unread} unread messages`} data-testid="cw-unread-badge">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
