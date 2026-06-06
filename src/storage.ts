import type { ChatMessage, MessageStore } from "./types.js";

/** Minimal shape of the Web Storage API we rely on. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Runtime type guard: is a parsed value a structurally valid message? */
function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "bot") &&
    typeof m.text === "string" &&
    typeof m.timestamp === "number"
  );
}

/**
 * Parse a JSON transcript, discarding anything malformed. Always returns a
 * clean array so corrupt persisted state can never crash the widget.
 */
export function parseTranscript(raw: string | null): ChatMessage[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isChatMessage);
  } catch {
    return [];
  }
}

/**
 * An in-memory {@link MessageStore}. Useful for tests, SSR, and as a
 * default when no persistence is configured.
 */
export class MemoryStore implements MessageStore {
  private messages: ChatMessage[] = [];

  load(): ChatMessage[] {
    return [...this.messages];
  }

  save(messages: readonly ChatMessage[]): void {
    this.messages = [...messages];
  }

  clear(): void {
    this.messages = [];
  }
}

/**
 * A {@link MessageStore} backed by a Web Storage implementation
 * (`localStorage`/`sessionStorage`). Falls back to a no-op when storage is
 * unavailable or throws (e.g. private mode quota errors), so persistence
 * failures never break the conversation.
 */
export class WebStorageStore implements MessageStore {
  private readonly key: string;
  private readonly storage: StorageLike | null;

  constructor(key = "chatbot-widget:transcript", storage?: StorageLike) {
    this.key = key;
    this.storage = storage ?? resolveDefaultStorage();
  }

  load(): ChatMessage[] {
    if (!this.storage) {
      return [];
    }
    try {
      return parseTranscript(this.storage.getItem(this.key));
    } catch {
      return [];
    }
  }

  save(messages: readonly ChatMessage[]): void {
    if (!this.storage) {
      return;
    }
    try {
      this.storage.setItem(this.key, JSON.stringify(messages));
    } catch {
      // Ignore quota/availability errors — persistence is best-effort.
    }
  }

  clear(): void {
    if (!this.storage) {
      return;
    }
    try {
      this.storage.removeItem(this.key);
    } catch {
      // Ignore.
    }
  }
}

/** Resolve `globalThis.localStorage` if present and usable, else null. */
function resolveDefaultStorage(): StorageLike | null {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}
