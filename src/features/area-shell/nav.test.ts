import { isActive } from "./nav";

describe("isActive", () => {
  it("matches the page and pages under it", () => {
    expect(isActive("/dashboard", "/dashboard")).toBe(true);
    expect(isActive("/admin/appointments/a1", "/admin")).toBe(true);
    expect(isActive("/administer", "/admin")).toBe(false);
  });

  it("exact links ignore pages under them", () => {
    expect(isActive("/dashboard/book", "/dashboard", true)).toBe(false);
    expect(isActive("/dashboard", "/dashboard", true)).toBe(true);
    expect(isActive("/dashboard/book", "/dashboard/book")).toBe(true);
  });

  it("only matches the homepage exactly", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/dashboard", "/")).toBe(false);
  });
});
