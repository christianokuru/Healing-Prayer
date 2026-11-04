import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#4b2a5e", "#4b2a5e")).toBe(1);
  });

  it("rejects malformed input", () => {
    expect(() => contrastRatio("plum", "#ffffff")).toThrow();
  });
});

// Reads the real tokens so a colour change that breaks WCAG AA fails CI (UI.md section 3.1).
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokensIn(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]),
  );
}

const lightBlock = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";

// [text, background, minimum ratio]
const PAIRS: [string, string, number][] = [
  ["ink", "bg", 4.5],
  ["ink", "surface", 4.5],
  ["ink", "off", 4.5],
  ["ink", "plum-soft", 4.5],
  ["ink", "gold-soft", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["muted", "off", 4.5],
  ["muted", "plum-soft", 4.5],
  ["plum", "bg", 4.5],
  ["plum", "surface", 4.5],
  ["plum", "plum-soft", 4.5],
  ["plum-ink", "plum", 4.5],
  ["plum-ink", "night", 4.5],
  ["gold", "bg", 4.5], // labels and numerals
  ["gold", "surface", 4.5],
  ["gold", "gold-soft", 4.5],
  ["gold-glow", "night", 4.5], // labels on dark
  ["gold-glow", "plum", 4.5],
  ["night", "gold-bright", 4.5], // text on gold buttons
  ["ok", "ok-soft", 4.5],
  ["danger", "danger-soft", 4.5],
  ["danger", "surface", 4.5],
];

describe("light theme tokens", () => {
  const tokens = tokensIn(lightBlock);
  it.each(PAIRS)("%s on %s meets %s:1", (fg, bg, min) => {
    const a = tokens[fg];
    const b = tokens[bg];
    if (!a || !b) throw new Error(`Missing token --${a ? bg : fg}`);
    expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(min);
  });
});
