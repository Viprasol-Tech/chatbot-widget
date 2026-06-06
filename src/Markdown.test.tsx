import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./Markdown.js";

describe("Markdown", () => {
  it("renders bold and italic as semantic elements", () => {
    const { container } = render(<Markdown source="**bold** and _italic_" />);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("renders safe links with rel hardening", () => {
    render(<Markdown source="[site](https://viprasol.com)" />);
    const link = screen.getByText("site") as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://viprasol.com");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("does not render an anchor for a javascript: link", () => {
    const { container } = render(<Markdown source="[x](javascript:alert(1))" />);
    expect(container.querySelector("a")).toBeNull();
  });

  it("never injects raw html from the source", () => {
    const { container } = render(<Markdown source="<img src=x onerror=alert(1)>" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img");
  });

  it("renders fenced code in a pre block", () => {
    const { container } = render(<Markdown source={"```\nconst x = 1;\n```"} />);
    expect(container.querySelector("pre code")?.textContent).toContain("const x = 1;");
  });
});
