import { describe, it, expect } from "vitest";
import { MemoryStore, WebStorageStore, parseTranscript, type StorageLike } from "./storage.js";
import type { ChatMessage } from "./types.js";

function msg(text: string): ChatMessage {
  return { id: `id_${text}`, role: "user", text, timestamp: 1000 };
}

class FakeStorage implements StorageLike {
  map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

describe("parseTranscript", () => {
  it("returns [] for null, invalid JSON, and non-arrays", () => {
    expect(parseTranscript(null)).toEqual([]);
    expect(parseTranscript("not json")).toEqual([]);
    expect(parseTranscript('{"a":1}')).toEqual([]);
  });

  it("filters out structurally invalid entries", () => {
    const raw = JSON.stringify([
      msg("ok"),
      { id: "x", role: "alien", text: "no", timestamp: 1 },
      { id: "y", text: "missing role", timestamp: 1 },
    ]);
    const out = parseTranscript(raw);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("ok");
  });
});

describe("MemoryStore", () => {
  it("round-trips messages and isolates copies", () => {
    const store = new MemoryStore();
    expect(store.load()).toEqual([]);
    const list = [msg("a"), msg("b")];
    store.save(list);
    const loaded = store.load();
    expect(loaded).toHaveLength(2);
    expect(loaded).not.toBe(list);
  });

  it("clears state", () => {
    const store = new MemoryStore();
    store.save([msg("a")]);
    store.clear();
    expect(store.load()).toEqual([]);
  });
});

describe("WebStorageStore", () => {
  it("persists to and loads from injected storage", () => {
    const fake = new FakeStorage();
    const store = new WebStorageStore("k", fake);
    store.save([msg("hello")]);
    expect(fake.getItem("k")).toContain("hello");
    expect(new WebStorageStore("k", fake).load()[0].text).toBe("hello");
  });

  it("clears the key", () => {
    const fake = new FakeStorage();
    const store = new WebStorageStore("k", fake);
    store.save([msg("x")]);
    store.clear();
    expect(fake.getItem("k")).toBeNull();
    expect(store.load()).toEqual([]);
  });

  it("never throws when the storage backend fails", () => {
    const throwing: StorageLike = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };
    const store = new WebStorageStore("k", throwing);
    expect(() => store.save([msg("a")])).not.toThrow();
    expect(store.load()).toEqual([]);
    expect(() => store.clear()).not.toThrow();
  });
});
