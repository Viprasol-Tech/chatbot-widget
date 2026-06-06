import type { QuickReply } from "./types.js";

export interface QuickRepliesProps {
  /** The chips to render. Rendering is skipped when empty. */
  replies: readonly QuickReply[];
  /** Invoked with the chosen reply's `value` (falling back to its label). */
  onSelect: (value: string) => void;
  /** Disable interaction while a reply is in flight. */
  disabled?: boolean;
}

/**
 * A row of tappable quick-reply chips. Selecting one submits its value as
 * though the user had typed it.
 */
export function QuickReplies({ replies, onSelect, disabled = false }: QuickRepliesProps) {
  if (replies.length === 0) {
    return null;
  }
  return (
    <div className="cw-quick-replies" role="group" aria-label="Quick replies" data-testid="cw-quick-replies">
      {replies.map((reply) => (
        <button
          key={reply.id}
          type="button"
          className="cw-quick-reply"
          disabled={disabled}
          data-testid="cw-quick-reply"
          onClick={() => onSelect(reply.value ?? reply.label)}
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
