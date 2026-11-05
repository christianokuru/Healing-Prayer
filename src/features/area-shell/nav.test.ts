import { isActive } from "./nav";

describe("isActive", () => {
  it("matches the page and pages under it", () => {
    expect(isActive("/dashboard", "/dashboard")).toBe(true);
    expect(isActive("/admin/appointments/a1", "/admin")).toBe(true);
    expect(isActive("/administer", "/admin")).toBe(false);
  });

  it("only matches the homepage exactly", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/dashboard", "/")).toBe(false);
  });
});
