import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickReplies } from "./QuickReplies.js";
import type { QuickReply } from "./types.js";

const replies: QuickReply[] = [
  { id: "a", label: "Yes" },
  { id: "b", label: "Pricing", value: "Tell me about pricing" },
];

describe("QuickReplies", () => {
  it("renders nothing when there are no replies", () => {
    const { container } = render(<QuickReplies replies={[]} onSelect={vi.fn()} />);
    expect(container.querySelector(".cw-quick-replies")).toBeNull();
  });

  it("renders one button per reply", () => {
    render(<QuickReplies replies={replies} onSelect={vi.fn()} />);
    expect(screen.getAllByTestId("cw-quick-reply")).toHaveLength(2);
  });

  it("selects the label when no value is set", () => {
    const onSelect = vi.fn();
    render(<QuickReplies replies={replies} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Yes"));
    expect(onSelect).toHaveBeenCalledWith("Yes");
  });

  it("prefers an explicit value over the label", () => {
    const onSelect = vi.fn();
    render(<QuickReplies replies={replies} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Pricing"));
    expect(onSelect).toHaveBeenCalledWith("Tell me about pricing");
  });

  it("disables the chips when disabled", () => {
    render(<QuickReplies replies={replies} onSelect={vi.fn()} disabled />);
    for (const btn of screen.getAllByTestId("cw-quick-reply")) {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    }
  });
});
