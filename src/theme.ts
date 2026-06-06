import type { CSSProperties } from "react";

/**
 * Visual theme for the widget. Every field is optional; unspecified values
 * fall back to {@link defaultTheme}. Colors accept any valid CSS color
 * string.
 */
export interface ChatTheme {
  /** Primary brand color: launcher, send button, user bubbles. */
  primary?: string;
  /** Text color used on top of the primary color. */
  onPrimary?: string;
  /** Panel and surface background. */
  surface?: string;
  /** Default text color on surfaces. */
  onSurface?: string;
  /** Bot bubble background. */
  botBubble?: string;
  /** Text color inside bot bubbles. */
  onBotBubble?: string;
  /** Corner radius applied to bubbles and the panel, in pixels. */
  radius?: number;
  /** Base font family stack. */
  fontFamily?: string;
}

/** The built-in light theme used when no overrides are supplied. */
export const defaultTheme: Required<ChatTheme> = {
  primary: "#4f46e5",
  onPrimary: "#ffffff",
  surface: "#ffffff",
  onSurface: "#111827",
  botBubble: "#f3f4f6",
  onBotBubble: "#111827",
  radius: 12,
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

/** A ready-made dark theme consumers can pass directly. */
export const darkTheme: Required<ChatTheme> = {
  primary: "#6366f1",
  onPrimary: "#ffffff",
  surface: "#1f2937",
  onSurface: "#f9fafb",
  botBubble: "#374151",
  onBotBubble: "#f9fafb",
  radius: 12,
  fontFamily: defaultTheme.fontFamily,
};

/** Merge a partial theme over the defaults, producing a complete theme. */
export function resolveTheme(theme?: ChatTheme): Required<ChatTheme> {
  return { ...defaultTheme, ...theme };
}

/**
 * Convert a theme into the CSS custom properties the widget's stylesheet
 * reads. Apply the result as the `style` of the widget root.
 */
export function themeToCssVars(theme?: ChatTheme): CSSProperties {
  const t = resolveTheme(theme);
  return {
    ["--cw-primary" as string]: t.primary,
    ["--cw-on-primary" as string]: t.onPrimary,
    ["--cw-surface" as string]: t.surface,
    ["--cw-on-surface" as string]: t.onSurface,
    ["--cw-bot-bubble" as string]: t.botBubble,
    ["--cw-on-bot-bubble" as string]: t.onBotBubble,
    ["--cw-radius" as string]: `${t.radius}px`,
    ["--cw-font-family" as string]: t.fontFamily,
  } as CSSProperties;
}
