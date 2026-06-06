/**
 * A token produced by the markdown-safe parser. Every token carries
 * already-escaped, render-safe text — there is no raw HTML anywhere in the
 * pipeline, so the output cannot inject markup.
 */
export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

/** A block-level element: a paragraph of inline tokens or a code fence. */
export type Block =
  | { type: "paragraph"; tokens: InlineToken[] }
  | { type: "code"; value: string };

/**
 * Escape the five HTML-significant characters so a string can never be
 * interpreted as markup when rendered. This is the security backbone of
 * the renderer.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Only `http`, `https`, and `mailto` URLs are allowed in links. Anything
 * else (notably `javascript:` and `data:`) is rejected so a crafted bot
 * reply cannot smuggle an executable URL into an anchor.
 */
export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) {
    return true;
  }
  // Allow protocol-relative and relative paths, but never a scheme we
  // don't recognise.
  return !/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

const INLINE_PATTERN =
  /(\[([^\]]+)\]\(([^)\s]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)/g;

/**
 * Parse a single line of text into inline tokens, supporting links,
 * inline code, bold (`**`), and italic (`*` / `_`). Token values are kept
 * raw (NOT HTML-escaped) because the {@link "./Markdown"} component renders
 * them through React, which escapes text nodes automatically — the safety
 * guarantee. The only active filter here is link-scheme validation: an
 * unsafe `href` (e.g. `javascript:`) degrades to a plain text token so no
 * dangerous anchor is ever produced. Use {@link escapeHtml} when rendering
 * tokens to a raw string sink instead of React.
 */
export function parseInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      const label = match[2] ?? "";
      const href = match[3] ?? "";
      if (isSafeHref(href)) {
        tokens.push({ type: "link", value: label, href });
      } else {
        // Unsafe link: degrade to plain text so nothing dangerous renders.
        tokens.push({ type: "text", value: match[1] });
      }
    } else if (match[4] !== undefined) {
      tokens.push({ type: "code", value: match[5] ?? "" });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "bold", value: match[7] ?? "" });
    } else if (match[8] !== undefined) {
      tokens.push({ type: "italic", value: match[9] ?? "" });
    } else if (match[10] !== undefined) {
      tokens.push({ type: "italic", value: match[11] ?? "" });
    }

    lastIndex = INLINE_PATTERN.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Parse a markdown string into block tokens. Supports fenced code blocks
 * (```), and paragraphs separated by blank lines. Inside paragraphs the
 * inline grammar from {@link parseInline} applies. Values are raw; the
 * React renderer escapes them safely on output.
 */
export function parseMarkdown(input: string): Block[] {
  const blocks: Block[] = [];
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").trimStart().startsWith("```")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ type: "code", value: code.join("\n") });
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "" && !(lines[i] ?? "").trimStart().startsWith("```")) {
      paragraph.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "paragraph", tokens: parseInline(paragraph.join("\n")) });
  }

  return blocks;
}
