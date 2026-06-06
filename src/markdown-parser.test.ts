import { describe, it, expect } from "vitest";
import { escapeHtml, isSafeHref, parseInline, parseMarkdown } from "./markdown-parser.js";

describe("escapeHtml", () => {
  it("escapes all five HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x" id='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; id=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    );
  });

  it("neutralises a script injection attempt", () => {
    const evil = "<script>alert(1)</script>";
    const safe = escapeHtml(evil);
    expect(safe).not.toContain("<script>");
    expect(safe).toContain("&lt;script&gt;");
  });
});

describe("isSafeHref", () => {
  it("allows http, https, and mailto", () => {
    expect(isSafeHref("https://viprasol.com")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("mailto:support@viprasol.com")).toBe(true);
  });

  it("allows relative and protocol-relative urls", () => {
    expect(isSafeHref("/docs")).toBe(true);
    expect(isSafeHref("//cdn.example.com/x")).toBe(true);
  });

  it("rejects javascript and data schemes", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<script>")).toBe(false);
    expect(isSafeHref("vbscript:msgbox")).toBe(false);
  });
});

describe("parseInline", () => {
  it("parses bold, italic, and code", () => {
    const tokens = parseInline("a **b** _c_ `d`");
    expect(tokens.map((t) => t.type)).toEqual(["text", "bold", "text", "italic", "text", "code"]);
    expect(tokens[1]).toMatchObject({ type: "bold", value: "b" });
    expect(tokens[5]).toMatchObject({ type: "code", value: "d" });
  });

  it("parses safe links and escapes their text", () => {
    const tokens = parseInline("see [Viprasol](https://viprasol.com)");
    const link = tokens.find((t) => t.type === "link");
    expect(link).toMatchObject({ type: "link", value: "Viprasol", href: "https://viprasol.com" });
  });

  it("degrades an unsafe link to escaped text (no link token)", () => {
    const tokens = parseInline("[x](javascript:alert(1))");
    expect(tokens.every((t) => t.type === "text")).toBe(true);
    expect(tokens.some((t) => t.type === "link")).toBe(false);
  });

  it("keeps raw html as plain text tokens (React escapes on render)", () => {
    const tokens = parseInline("hi <img src=x onerror=alert(1)>");
    expect(tokens.every((t) => t.type === "text")).toBe(true);
    expect(tokens.map((t) => t.value).join("")).toBe("hi <img src=x onerror=alert(1)>");
  });
});

describe("parseMarkdown", () => {
  it("splits paragraphs on blank lines", () => {
    const blocks = parseMarkdown("first para\n\nsecond para");
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("paragraph");
    expect(blocks[1].type).toBe("paragraph");
  });

  it("captures fenced code blocks verbatim", () => {
    const blocks = parseMarkdown("```\n<b>x</b>\n```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "code", value: "<b>x</b>" });
  });

  it("returns an empty array for empty input", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("\n\n")).toEqual([]);
  });
});
