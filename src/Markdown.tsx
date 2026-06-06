import { Fragment } from "react";
import type { Block, InlineToken } from "./markdown-parser.js";
import { parseMarkdown } from "./markdown-parser.js";

export interface MarkdownProps {
  /** Raw markdown source. Rendered safely — no raw HTML is ever injected. */
  source: string;
}

function renderInline(token: InlineToken, key: number) {
  switch (token.type) {
    case "bold":
      return <strong key={key}>{token.value}</strong>;
    case "italic":
      return <em key={key}>{token.value}</em>;
    case "code":
      return (
        <code key={key} className="cw-md__code">
          {token.value}
        </code>
      );
    case "link":
      return (
        <a key={key} href={token.href} target="_blank" rel="noopener noreferrer nofollow">
          {token.value}
        </a>
      );
    case "text":
    default:
      return <Fragment key={key}>{token.value}</Fragment>;
  }
}

function renderBlock(block: Block, key: number) {
  if (block.type === "code") {
    return (
      <pre key={key} className="cw-md__pre">
        <code>{block.value}</code>
      </pre>
    );
  }
  return (
    <p key={key} className="cw-md__p">
      {block.tokens.map((token, i) => renderInline(token, i))}
    </p>
  );
}

/**
 * Render markdown text safely. The source is tokenised by
 * {@link parseMarkdown}; because every value is HTML-escaped and links are
 * scheme-filtered, the component never uses `dangerouslySetInnerHTML` and
 * cannot execute injected scripts.
 */
export function Markdown({ source }: MarkdownProps) {
  const blocks = parseMarkdown(source);
  return (
    <span className="cw-md" data-testid="cw-markdown">
      {blocks.map((block, i) => renderBlock(block, i))}
    </span>
  );
}
