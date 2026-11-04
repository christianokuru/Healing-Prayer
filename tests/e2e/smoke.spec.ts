import { expect, test } from "@playwright/test";

test("homepage loads with the church name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Healing Prayer", { exact: true })).toBeVisible();
});

test("token sheet renders without horizontal scroll", async ({ page }) => {
  await page.goto("/dev/tokens");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
