import { describe, it, expect } from "vitest";
import { darkTheme, defaultTheme, resolveTheme, themeToCssVars } from "./theme.js";

describe("resolveTheme", () => {
  it("returns defaults when no overrides are given", () => {
    expect(resolveTheme()).toEqual(defaultTheme);
  });

  it("merges partial overrides over the defaults", () => {
    const t = resolveTheme({ primary: "#000", radius: 4 });
    expect(t.primary).toBe("#000");
    expect(t.radius).toBe(4);
    expect(t.surface).toBe(defaultTheme.surface);
  });
});

describe("themeToCssVars", () => {
  it("emits the documented custom properties", () => {
    const vars = themeToCssVars({ primary: "#abc", radius: 8 }) as Record<string, string>;
    expect(vars["--cw-primary"]).toBe("#abc");
    expect(vars["--cw-radius"]).toBe("8px");
    expect(vars["--cw-surface"]).toBe(defaultTheme.surface);
  });

  it("renders the dark theme distinctly from the default", () => {
    const dark = themeToCssVars(darkTheme) as Record<string, string>;
    const light = themeToCssVars(defaultTheme) as Record<string, string>;
    expect(dark["--cw-surface"]).not.toBe(light["--cw-surface"]);
  });
});
