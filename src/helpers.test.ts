import { describe, it, expect } from "vitest";
import { appendMessage, createMessageId, formatTime, isSendable } from "./helpers.js";
import type { ChatMessage } from "./types.js";

describe("appendMessage", () => {
  it("adds a message without mutating the input array", () => {
    const original: ChatMessage[] = [];
    const next = appendMessage(original, "user", "hello", 1000);

    expect(original).toHaveLength(0);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ role: "user", text: "hello", timestamp: 1000 });
    expect(typeof next[0].id).toBe("string");
    expect(next[0].id.length).toBeGreaterThan(0);
  });

  it("preserves prior messages and order", () => {
    const a = appendMessage([], "user", "first", 1);
    const b = appendMessage(a, "bot", "second", 2);

    expect(b.map((m) => m.text)).toEqual(["first", "second"]);
    expect(b.map((m) => m.role)).toEqual(["user", "bot"]);
  });
});

describe("createMessageId", () => {
  it("returns unique ids on each call", () => {
    const ids = new Set([createMessageId(), createMessageId(), createMessageId()]);
    expect(ids.size).toBe(3);
  });
});

describe("formatTime", () => {
  it("formats an epoch ms value as zero-padded HH:MM (local)", () => {
    const date = new Date(2024, 0, 1, 9, 5, 0);
    expect(formatTime(date.getTime())).toBe("09:05");
  });

  it("handles afternoon times in 24h form", () => {
    const date = new Date(2024, 0, 1, 23, 45, 0);
    expect(formatTime(date.getTime())).toBe("23:45");
  });
});

describe("isSendable", () => {
  it("is false for empty or whitespace-only text", () => {
    expect(isSendable("")).toBe(false);
    expect(isSendable("   ")).toBe(false);
    expect(isSendable("\n\t")).toBe(false);
  });

  it("is true when there is real content", () => {
    expect(isSendable("hi")).toBe(true);
    expect(isSendable("  padded  ")).toBe(true);
  });
});
