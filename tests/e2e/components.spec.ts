import { expect, test } from "@playwright/test";

test.describe("component gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/components");
  });

  test("dialog opens, traps the page and closes on Escape with focus restored", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Cancel booking…" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Cancel this booking?" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("confirming in the dialog shows a toast", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel booking…" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel booking", exact: true })
      .click();
    await expect(page.getByRole("status").filter({ hasText: "Booking cancelled." })).toBeVisible();
  });

  test("toggle switches the pressed option", async ({ page }) => {
    const calendar = page.getByRole("button", { name: "Calendar" });
    await calendar.click();
    await expect(calendar).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Upcoming days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("no sideways scroll", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
