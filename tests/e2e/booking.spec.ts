import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const uniqueEmail = () =>
  `book-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

/** Registers a fresh member in this request context (sets its session cookie). */
async function registerMember(request: APIRequestContext) {
  const res = await request.post("/api/auth/register", {
    data: {
      full_name: "Test Member",
      email: uniqueEmail(),
      phone: "4165550123",
      password: "longenough",
    },
  });
  expect(res.status()).toBe(201);
}

const freeSlots = (page: Page) => page.locator("[data-slot]:not([disabled])");

// Phone and desktop runs share one mock server and run at the same time, so each test and
// project books its own time instead of racing for the first free one.
const pick = (page: Page, project: string, fromEnd: boolean) => {
  const offset = project === "phone" ? 0 : 1;
  return fromEnd ? freeSlots(page).nth(-1 - offset) : freeSlots(page).nth(offset);
};

test.describe("booking page", () => {
  test("visitors can browse days, full days and blocked dates", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Choose a time to be prayed with",
    );
    await expect(page.getByRole("heading", { name: "Choose a time" })).toBeVisible();
    await expect(page.getByText(/No prayer session this week \(Christmas Eve\)/)).toBeVisible();
    await expect(page.getByText("Full", { exact: true }).first()).toBeVisible();
    await expect(freeSlots(page).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("a visitor who chooses a time is asked to log in and comes back to it", async ({ page }) => {
    await page.goto("/book");
    const slot = freeSlots(page).first();
    const start = await slot.getAttribute("data-slot");
    await slot.click();
    await expect(slot).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await expect(page).toHaveURL(/\/login\?next=%2Fbook%3Fslot%3D/);
    await expect(page.getByText("Log in to finish booking your prayer session.")).toBeVisible();

    const email = uniqueEmail();
    await page.request.post("/api/auth/register", {
      data: { full_name: "Back Again", email, phone: "4165550123", password: "longenough" },
    });
    await page.request.post("/api/auth/logout");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("longenough");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("heading", { name: "Your prayer point" })).toBeVisible();
    expect(decodeURIComponent(page.url())).toContain(`slot=${start}`);
  });

  test("a member books a time, then the rest of that week is locked", async ({ page }, info) => {
    await registerMember(page.request);
    await page.goto("/book");

    const slot = pick(page, info.project.name, false);
    const start = (await slot.getAttribute("data-slot")) ?? "";
    await slot.click();
    await page.getByRole("button", { name: "Continue" }).first().click();

    await expect(page.getByRole("heading", { name: "Your prayer point" })).toBeFocused();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Write your prayer point.")).toBeVisible();
    await page.getByLabel("What would you like prayer for?").fill("Healing for my mother.");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();
    await expect(page.getByText("One-on-one, 30 minutes")).toBeVisible();
    await expect(page.getByText("Healing for my mother.")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(
      page.getByRole("heading", { name: "Your prayer session is booked" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to times" }).click();

    const mine = page.locator(`[data-slot="${start}"]`);
    await expect(mine).toHaveAccessibleName(/your booking/);
    const card = page.locator("section", { has: mine });
    await expect(card.getByText(/You already have a booking this week/)).toBeVisible();
    await expect(card.locator("[data-slot]:not([disabled])")).toHaveCount(0);
  });

  test("if someone else takes the time first, the member is told and keeps their prayer point", async ({
    page,
    playwright,
    baseURL,
  }, info) => {
    await registerMember(page.request);
    await page.goto("/book");
    const slot = pick(page, info.project.name, true);
    const start = (await slot.getAttribute("data-slot")) ?? "";
    await slot.click();
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.getByLabel("What would you like prayer for?").fill("Peace in our home.");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Check and confirm" })).toBeVisible();

    // Another member books the same time from another device.
    const other = await playwright.request.newContext({ baseURL });
    await registerMember(other);
    const taken = await other.post("/api/appointments", {
      data: { slot_start: start, prayer_point: "Someone else" },
    });
    expect(taken.status()).toBe(201);
    await other.dispose();

    // Either live polling or the confirm call notices; both end in the same place.
    if (await page.getByRole("button", { name: "Confirm booking" }).isVisible()) {
      await page.getByRole("button", { name: "Confirm booking" }).click();
    }
    await expect(page.getByRole("heading", { name: "Choose a time" })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /just taken/ })).toBeVisible();
    await expect(page.locator(`[data-slot="${start}"]`)).toBeDisabled();

    await freeSlots(page).first().click();
    await page.getByRole("button", { name: "Continue" }).first().click();
    await expect(page.getByLabel("What would you like prayer for?")).toHaveValue(
      "Peace in our home.",
    );
  });

  test("the calendar shows a day's times when it is picked, and arrow keys move between days", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Keyboard navigation is a desktop concern");
    await page.goto("/book");
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.getByText("Tap a highlighted day to see its times.")).toBeVisible();
    const days = page.locator("[data-day]");
    await days.first().click();
    await expect(page.locator("section [data-slot]").first()).toBeVisible();
    await days.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(days.nth(1)).toBeFocused();
  });
});
