import { describe, it, expect } from "vitest";
import {
  appendMessage,
  countUnread,
  createMessageId,
  formatTime,
  isInFlight,
  isSendable,
  updateMessage,
} from "./helpers.js";
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

describe("appendMessage extras", () => {
  it("attaches status and quick replies when provided", () => {
    const next = appendMessage([], "bot", "hi", 5, {
      status: "streaming",
      quickReplies: [{ id: "q1", label: "Yes" }],
    });
    expect(next[0]).toMatchObject({ status: "streaming" });
    expect(next[0].quickReplies).toHaveLength(1);
  });
});

describe("updateMessage", () => {
  it("patches only the matching message without mutating the list", () => {
    const a = appendMessage([], "bot", "", 1, { status: "streaming" });
    const id = a[0].id;
    const b = updateMessage(a, id, { text: "grown", status: "complete" });
    expect(a[0].text).toBe("");
    expect(b[0]).toMatchObject({ text: "grown", status: "complete" });
  });

  it("returns an equivalent list when no id matches", () => {
    const a = appendMessage([], "user", "x", 1);
    const b = updateMessage(a, "missing", { text: "no" });
    expect(b.map((m) => m.text)).toEqual(["x"]);
  });
});

describe("countUnread", () => {
  const base: ChatMessage[] = [
    { id: "1", role: "user", text: "u", timestamp: 100 },
    { id: "2", role: "bot", text: "old", timestamp: 100 },
    { id: "3", role: "bot", text: "new", timestamp: 200, status: "complete" },
    { id: "4", role: "bot", text: "typing", timestamp: 300, status: "streaming" },
  ];

  it("counts only completed bot messages at or after `since`", () => {
    expect(countUnread(base, 150)).toBe(1);
  });

  it("counts nothing when since is in the future", () => {
    expect(countUnread(base, 9999)).toBe(0);
  });
});

describe("isInFlight", () => {
  it("is true for sending/streaming and false otherwise", () => {
    expect(isInFlight("sending")).toBe(true);
    expect(isInFlight("streaming")).toBe(true);
    expect(isInFlight("complete")).toBe(false);
    expect(isInFlight(undefined)).toBe(false);
  });
});
