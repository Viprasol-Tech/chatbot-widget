<div align="center">
  <img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />
</div>

# chatbot-widget

> Embeddable React chatbot widget — floating launcher, panel, message list, input.

Built and maintained by Viprasol Tech.

<p align="center">
  <a href="https://github.com/Viprasol-Tech/chatbot-widget/actions"><img src="https://github.com/Viprasol-Tech/chatbot-widget/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg" alt="TypeScript strict" /></a>
</p>

A tiny, dependency-light React chatbot widget you can drop into any app. It renders a floating launcher button that toggles a chat panel containing a scrollable message list (user/bot bubbles) and a text input. Message sending is fully pluggable — you supply an `onSend(text)` handler that returns the bot reply.

## Features

- **Floating launcher** — a single button that toggles the chat panel open and closed.
- **Message list** — user and bot bubbles with timestamps, rendered as an accessible `role="log"`.
- **Composer input** — submit on click or Enter; empty/whitespace input is ignored.
- **Pluggable backend** — bring your own `onSend(text) => Promise<string>` (REST, LLM, websocket, anything).
- **Pending state** — shows a typing indicator while the reply is in flight; gracefully handles errors.
- **Pure, testable helpers** — `appendMessage`, `formatTime`, `isSendable`, `createMessageId`.
- **Strict TypeScript** — full types exported; zero runtime dependencies beyond React.

## Install

```bash
npm install chatbot-widget react react-dom
```

`react` and `react-dom` (>= 18) are peer dependencies.

## Usage

```tsx
import { ChatWidget } from "chatbot-widget";

async function handleSend(text: string): Promise<string> {
  // Call your own API / LLM here and return the reply text.
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  const data = (await res.json()) as { reply: string };
  return data.reply;
}

export function App() {
  return (
    <ChatWidget
      onSend={handleSend}
      title="Support"
      initialMessages={[
        { id: "welcome", role: "bot", text: "Hi! How can I help?", timestamp: Date.now() },
      ]}
    />
  );
}
```

The widget renders unstyled, semantic markup with stable `cw-*` class names and `data-testid` hooks, so you can theme it freely with your own CSS.

## API

### `<ChatWidget>`

| Prop              | Type                                   | Default          | Description                                         |
| ----------------- | -------------------------------------- | ---------------- | --------------------------------------------------- |
| `onSend`          | `(text: string) => Promise<string>`    | —                | Required. Receives user text, resolves bot reply.   |
| `title`           | `string`                               | `"Chat with us"` | Panel header title.                                 |
| `defaultOpen`     | `boolean`                              | `false`          | Whether the panel starts open.                      |
| `initialMessages` | `readonly ChatMessage[]`               | `[]`             | Seed messages (e.g. a greeting).                    |
| `placeholder`     | `string`                               | `"Type a message…"` | Input placeholder.                               |

### Helpers

- `appendMessage(messages, role, text, timestamp?) => ChatMessage[]` — returns a new list with an appended message (never mutates).
- `formatTime(timestampMs) => string` — zero-padded 24-hour `HH:MM`.
- `isSendable(text) => boolean` — true when text has non-whitespace content.
- `createMessageId() => string` — unique, ordered message id.

### Types

`ChatMessage`, `MessageRole` (`"user" | "bot"`), `SendHandler`, `ChatWidgetProps`, `MessageListProps`, `ChatInputProps`.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build       # tsc -> dist/
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## Contact — Viprasol Tech Private Limited

- Website: [viprasol.com](https://viprasol.com)
- Email: [support@viprasol.com](mailto:support@viprasol.com)
- Telegram: [t.me/viprasol_help](https://t.me/viprasol_help) | WhatsApp: +91 96336 52112
- GitHub: [@Viprasol-Tech](https://github.com/Viprasol-Tech) | [LinkedIn](https://www.linkedin.com/in/viprasol/) | X [@viprasol](https://twitter.com/viprasol)

## License

[MIT](LICENSE) (c) 2025 Viprasol Tech Private Limited
