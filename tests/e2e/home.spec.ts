import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("shows every section in order with live session times", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Bring what is on your heart.",
    );
    const sections = await page.locator("main h2").allTextContents();
    expect(sections).toEqual([
      "A church that prays with you",
      "When we gather to pray",
      "How booking works",
      "Our ministries",
      "Find us",
    ]);
    const sessions = page.locator("#sessions");
    await expect(sessions.getByText("Thursday", { exact: true })).toBeVisible();
    await expect(sessions.getByText("7:00 – 9:00 PM")).toBeVisible();
    await expect(sessions.getByText(/All times in Eastern Time/)).toBeVisible();
    await expect(
      page.getByText(/^Next session · Thu \d+ \w+, 7:\d\d PM · \d times? free$/),
    ).toBeVisible();
  });

  test("Book prayer goes to the booking page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Book a prayer session" })).toHaveAttribute(
      "href",
      "/book",
    );
  });

  test("footer lists the session times", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer").getByText("7:00 – 9:00 PM")).toBeVisible();
  });

  test("no sideways scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("site header", () => {
  test("phone: the menu opens as a sheet with every link", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    for (const name of ["Home", "Book prayer", "Log in"]) {
      await expect(menu.getByRole("link", { name })).toBeVisible();
    }
  });

  test("phone: the menu closes after following a link", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });

  test("desktop: links are inline and the menu button is hidden", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" }).first();
    await expect(nav.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  });

  test("shows My bookings once a member is logged in", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop only");
    await page.request.post("/api/auth/login", {
      data: { email: "ngozi@example.com", password: "password123" },
    });
    await page.goto("/");
    await expect(page.getByRole("link", { name: "My bookings" })).toBeVisible();
  });
});
