import { describe, it, expect, vi } from "vitest";
import { chunkText, collectStream, fakeStream, toStreamHandler } from "./streaming.js";

describe("chunkText", () => {
  it("splits into word chunks preserving trailing whitespace", () => {
    expect(chunkText("hello world")).toEqual(["hello ", "world"]);
  });

  it("returns an empty array for blank input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   ")).toEqual([]);
  });
});

describe("collectStream", () => {
  it("concatenates all chunks and reports running totals", async () => {
    async function* gen() {
      yield "a";
      yield "b";
      yield "c";
    }
    const seen: string[] = [];
    const result = await collectStream(gen(), (acc) => seen.push(acc));
    expect(result).toBe("abc");
    expect(seen).toEqual(["a", "ab", "abc"]);
  });

  it("propagates errors from the stream", async () => {
    async function* gen() {
      yield "a";
      throw new Error("boom");
    }
    await expect(collectStream(gen())).rejects.toThrow("boom");
  });
});

describe("toStreamHandler", () => {
  it("wraps a send handler into a single-chunk stream", async () => {
    const send = vi.fn(async (t: string) => `reply:${t}`);
    const stream = toStreamHandler(send);
    const out = await collectStream(stream("hi"));
    expect(out).toBe("reply:hi");
    expect(send).toHaveBeenCalledWith("hi");
  });
});

describe("fakeStream", () => {
  it("streams a static reply word by word", async () => {
    const stream = fakeStream("one two three");
    const chunks: string[] = [];
    for await (const c of stream("ignored")) {
      chunks.push(c);
    }
    expect(chunks).toEqual(["one ", "two ", "three"]);
    expect(chunks.join("")).toBe("one two three");
  });
});
