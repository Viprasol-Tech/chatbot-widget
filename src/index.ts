export { ChatWidget } from "./ChatWidget.js";
export type { ChatWidgetProps } from "./ChatWidget.js";
export { MessageList, TypingIndicator } from "./MessageList.js";
export type { MessageListProps } from "./MessageList.js";
export { ChatInput } from "./ChatInput.js";
export type { ChatInputProps } from "./ChatInput.js";
export { QuickReplies } from "./QuickReplies.js";
export type { QuickRepliesProps } from "./QuickReplies.js";
export { Markdown } from "./Markdown.js";
export type { MarkdownProps } from "./Markdown.js";

export {
  appendMessage,
  countUnread,
  createMessageId,
  formatTime,
  isInFlight,
  isSendable,
  updateMessage,
} from "./helpers.js";

export {
  chunkText,
  collectStream,
  fakeStream,
  toStreamHandler,
} from "./streaming.js";

export {
  MemoryStore,
  WebStorageStore,
  parseTranscript,
} from "./storage.js";
export type { StorageLike } from "./storage.js";

export {
  escapeHtml,
  isSafeHref,
  parseInline,
  parseMarkdown,
} from "./markdown-parser.js";
export type { Block, InlineToken } from "./markdown-parser.js";

export {
  darkTheme,
  defaultTheme,
  resolveTheme,
  themeToCssVars,
} from "./theme.js";
export type { ChatTheme } from "./theme.js";

export type {
  ChatMessage,
  MessageRole,
  MessageStatus,
  MessageStore,
  QuickReply,
  SendHandler,
  StreamHandler,
} from "./types.js";
