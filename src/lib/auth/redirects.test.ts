import { homeFor, loginUrl, safeNext } from "./redirects";

describe("auth redirects", () => {
  it("sends admins to /admin and members to /dashboard", () => {
    expect(homeFor({ role: "admin" })).toBe("/admin");
    expect(homeFor({ role: "user" })).toBe("/dashboard");
  });

  it("only allows paths on this site", () => {
    expect(safeNext("/book?slot=1")).toBe("/book?slot=1");
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("/\\evil.com")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it("builds a login URL that returns to the page", () => {
    expect(loginUrl("/admin/schedule")).toBe("/login?next=%2Fadmin%2Fschedule");
  });
});
