# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [SemVer](https://semver.org/).

## [0.2.0] - 2025

### Added
- **Streaming bot responses** via a new `onStream` prop and `StreamHandler`
  (async-generator) type. Replies render token-by-token as they arrive.
- **Streaming utilities**: `collectStream`, `toStreamHandler`, `fakeStream`,
  and `chunkText` for adapting request/response handlers and writing demos.
- **Message history persistence** through a pluggable `MessageStore`
  interface, with `MemoryStore` and `WebStorageStore` (localStorage/
  sessionStorage) adapters plus a defensive `parseTranscript` loader.
- **Quick-reply buttons** (`QuickReplies` component, `QuickReply` type, and
  `initialQuickReplies` prop) that submit a value when tapped.
- **Animated typing indicator** (`TypingIndicator`) replacing the static
  ellipsis placeholder.
- **Unread badge** on the launcher counting bot replies received while the
  panel is closed, with an `onUnreadChange` callback.
- **Theming**: `ChatTheme`, `defaultTheme`, `darkTheme`, `resolveTheme`, and
  `themeToCssVars` driving CSS custom properties on the widget root.
- **Markdown-safe rendering**: a `Markdown` component plus `parseMarkdown`,
  `parseInline`, `escapeHtml`, and `isSafeHref`. Bold, italic, inline code,
  fenced code, and scheme-filtered links — never raw HTML, never
  `javascript:` URLs.
- New helpers: `updateMessage`, `countUnread`, and `isInFlight`, and a
  `status`/`quickReplies` field on `ChatMessage`.

### Changed
- `ChatWidget` now drives every reply through the streaming pipeline; bot
  bubbles carry a `data-status` attribute and grow in place while streaming.
- `appendMessage` accepts optional `status`/`quickReplies` extras.

### Tests
- Test count expanded from 12 to 65 across eight files, covering streaming,
  persistence, theming, markdown safety, quick replies, and the unread badge.

## [0.1.0] - 2025

### Added
- Initial release of chatbot-widget: Embeddable React chatbot widget — floating launcher, panel, message list, input.
