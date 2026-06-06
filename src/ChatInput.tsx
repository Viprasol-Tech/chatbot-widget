import { useState, type FormEvent, type KeyboardEvent } from "react";
import { isSendable } from "./helpers.js";

export interface ChatInputProps {
  /** Called with the trimmed text when the user submits a sendable message. */
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Text input plus send button for composing a message. */
export function ChatInput({ onSubmit, disabled = false, placeholder = "Type a message…" }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!isSendable(trimmed) || disabled) {
      return;
    }
    onSubmit(trimmed);
    setValue("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="cw-input" onSubmit={handleSubmit} data-testid="cw-input-form">
      <input
        type="text"
        className="cw-input__field"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Message"
        data-testid="cw-input-field"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className="cw-input__send"
        disabled={disabled || !isSendable(value)}
        data-testid="cw-send-button"
      >
        Send
      </button>
    </form>
  );
}
