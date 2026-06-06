import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatWidget } from "./ChatWidget.js";

describe("ChatWidget", () => {
  it("starts closed and the launcher toggles the panel open and closed", () => {
    const onSend = vi.fn().mockResolvedValue("hi");
    render(<ChatWidget onSend={onSend} />);

    // Panel hidden initially.
    expect(screen.queryByTestId("cw-panel")).toBeNull();

    // Open it.
    fireEvent.click(screen.getByTestId("cw-launcher"));
    expect(screen.getByTestId("cw-panel")).toBeTruthy();

    // Close it again via the launcher.
    fireEvent.click(screen.getByTestId("cw-launcher"));
    expect(screen.queryByTestId("cw-panel")).toBeNull();
  });

  it("can start open via defaultOpen", () => {
    const onSend = vi.fn().mockResolvedValue("hi");
    render(<ChatWidget onSend={onSend} defaultOpen />);
    expect(screen.getByTestId("cw-panel")).toBeTruthy();
  });

  it("typing and sending shows the user message and the fake bot reply", async () => {
    const onSend = vi.fn(async (text: string) => `echo: ${text}`);
    render(<ChatWidget onSend={onSend} defaultOpen />);

    const field = screen.getByTestId("cw-input-field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "hello bot" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));

    // User message appears immediately.
    await screen.findByText("hello bot");
    expect(onSend).toHaveBeenCalledWith("hello bot");

    // Bot reply from the fake handler appears.
    await screen.findByText("echo: hello bot");

    const bubbles = screen.getAllByTestId("cw-bubble");
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0].getAttribute("data-role")).toBe("user");
    expect(bubbles[1].getAttribute("data-role")).toBe("bot");

    // Input clears after send.
    expect(field.value).toBe("");
  });

  it("does not send when the input is empty or whitespace only", () => {
    const onSend = vi.fn().mockResolvedValue("nope");
    render(<ChatWidget onSend={onSend} defaultOpen />);

    const field = screen.getByTestId("cw-input-field") as HTMLInputElement;

    // Empty submit.
    fireEvent.submit(screen.getByTestId("cw-input-form"));
    // Whitespace-only submit.
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.submit(screen.getByTestId("cw-input-form"));

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.queryAllByTestId("cw-bubble")).toHaveLength(0);
  });

  it("renders a graceful error bubble when the handler rejects", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("boom"));
    render(<ChatWidget onSend={onSend} defaultOpen />);

    const field = screen.getByTestId("cw-input-field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "trigger error" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });
  });
});
