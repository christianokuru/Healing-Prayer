import { cn } from "./cn";

describe("cn", () => {
  it("keeps a type token and a colour token together", () => {
    expect(cn("text-h1", "text-plum")).toBe("text-h1 text-plum");
  });

  it("lets a later colour override an earlier one", () => {
    expect(cn("text-plum", "text-ink")).toBe("text-ink");
  });

  it("lets a later type token override an earlier one", () => {
    expect(cn("text-h1 text-muted", "text-small")).toBe("text-muted text-small");
  });

  it("lets a later background override an earlier one", () => {
    expect(cn("bg-plum", "bg-surface")).toBe("bg-surface");
  });

  it("drops falsy values", () => {
    expect(cn("p-4", false, undefined, null, "", "gap-2")).toBe("p-4 gap-2");
  });
});
