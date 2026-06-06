import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatWidget } from "./ChatWidget.js";
import { MemoryStore } from "./storage.js";
import type { ChatMessage } from "./types.js";

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

  it("streams a reply chunk-by-chunk via onStream", async () => {
    async function* onStream() {
      yield "Hello ";
      yield "there!";
    }
    render(<ChatWidget onStream={onStream} defaultOpen />);

    const field = screen.getByTestId("cw-input-field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "hi" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));

    await screen.findByText("Hello there!");
    const bubbles = screen.getAllByTestId("cw-bubble");
    expect(bubbles[bubbles.length - 1].getAttribute("data-status")).toBe("complete");
  });

  it("renders bot markdown safely", async () => {
    const onSend = vi.fn(async () => "Visit [us](https://viprasol.com) **now**");
    render(<ChatWidget onSend={onSend} defaultOpen />);
    fireEvent.change(screen.getByTestId("cw-input-field"), { target: { value: "go" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));

    const link = (await screen.findByText("us")) as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://viprasol.com");
  });

  it("submits a quick reply as a user message", async () => {
    const onSend = vi.fn(async (t: string) => `got ${t}`);
    render(
      <ChatWidget
        onSend={onSend}
        defaultOpen
        initialQuickReplies={[{ id: "p", label: "Pricing", value: "pricing please" }]}
      />,
    );

    fireEvent.click(screen.getByText("Pricing"));
    await screen.findByText("pricing please");
    expect(onSend).toHaveBeenCalledWith("pricing please");
    // Quick replies clear after one is used.
    expect(screen.queryByTestId("cw-quick-replies")).toBeNull();
  });

  it("loads a persisted transcript from the store", async () => {
    const store = new MemoryStore();
    const seeded: ChatMessage[] = [
      { id: "s1", role: "bot", text: "Welcome back", timestamp: 1000, status: "complete" },
    ];
    store.save(seeded);

    render(<ChatWidget onSend={vi.fn()} defaultOpen store={store} />);
    await screen.findByText("Welcome back");
  });

  it("persists new messages to the store", async () => {
    const store = new MemoryStore();
    const onSend = vi.fn(async () => "saved reply");
    render(<ChatWidget onSend={onSend} defaultOpen store={store} />);

    fireEvent.change(screen.getByTestId("cw-input-field"), { target: { value: "save me" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));

    await waitFor(() => {
      expect(store.load().some((m) => m.text === "saved reply")).toBe(true);
    });
  });

  it("clears the conversation and the store", async () => {
    const store = new MemoryStore();
    store.save([{ id: "x", role: "bot", text: "old msg", timestamp: 1, status: "complete" }]);
    render(<ChatWidget onSend={vi.fn()} defaultOpen store={store} />);

    await screen.findByText("old msg");
    fireEvent.click(screen.getByTestId("cw-clear-button"));

    await waitFor(() => {
      expect(screen.queryByText("old msg")).toBeNull();
    });
    expect(store.load()).toEqual([]);
  });

  it("shows an unread badge for replies received while closed", async () => {
    const onSend = vi.fn(async () => "ping");
    render(<ChatWidget onSend={onSend} defaultOpen />);

    fireEvent.change(screen.getByTestId("cw-input-field"), { target: { value: "hey" } });
    fireEvent.click(screen.getByTestId("cw-send-button"));
    await screen.findByText("ping");

    // Close the panel — the bot reply is now unread.
    fireEvent.click(screen.getByTestId("cw-launcher"));
    await waitFor(() => {
      expect(screen.getByTestId("cw-unread-badge")).toBeTruthy();
    });

    // Reopening clears the badge.
    fireEvent.click(screen.getByTestId("cw-launcher"));
    expect(screen.queryByTestId("cw-unread-badge")).toBeNull();
  });

  it("applies theme custom properties to the root", () => {
    const { container } = render(
      <ChatWidget onSend={vi.fn()} theme={{ primary: "#ff0000" }} />,
    );
    const root = container.querySelector(".cw-root") as HTMLElement;
    expect(root.style.getPropertyValue("--cw-primary")).toBe("#ff0000");
  });
});
