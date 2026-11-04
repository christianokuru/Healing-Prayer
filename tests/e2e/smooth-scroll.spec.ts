import { expect, test } from "@playwright/test";

// Lenis only smooths mouse wheel and trackpad, so these run on the desktop project.
test.describe("smooth scrolling", () => {
  test.skip(({ isMobile }) => isMobile, "Touch scrolling stays native");

  test("wheel scrolling moves the page through Lenis", async ({ page }) => {
    await page.goto("/dev/components");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  });

  test("the page does not scroll behind an open dialog", async ({ page }) => {
    await page.goto("/dev/components");
    await page.getByRole("button", { name: "Cancel booking…" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("is not started for users who prefer reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/dev/components");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await context.close();
  });
});
