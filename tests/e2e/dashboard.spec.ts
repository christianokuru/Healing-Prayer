import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const uniqueEmail = () =>
  `dash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

async function registerMember(request: APIRequestContext) {
  const res = await request.post("/api/auth/register", {
    data: {
      full_name: "Ruth Member",
      email: uniqueEmail(),
      phone: "4165550123",
      password: "longenough",
    },
  });
  expect(res.status()).toBe(201);
}

/** Books any free time for the logged-in member, retrying if another test got there first. */
async function bookSomething(request: APIRequestContext): Promise<string> {
  const schedule = await (await request.get("/api/schedule")).json();
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 50 * 86_400_000).toISOString().slice(0, 10);
  const { slots } = await (await request.get(`/api/slots?from=${from}&to=${to}`)).json();
  const free = slots.filter(
    (s: { state: string; bookable: boolean }) => s.state === "free" && s.bookable,
  );
  for (const slot of free.sort(() => Math.random() - 0.5)) {
    const res = await request.post("/api/appointments", {
      data: { slot_start: slot.start, prayer_point: "Strength for the week." },
    });
    if (res.status() === 201) return slot.start;
  }
  throw new Error(`No free time to book (${schedule.timezone})`);
}

async function openAccountMenu(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
}

test.describe("member dashboard", () => {
  test("a new member sees a friendly empty state", async ({ page }) => {
    await registerMember(page.request);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Peace be with you, Ruth");
    await expect(page.getByText("You have no bookings yet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book prayer" }).last()).toHaveAttribute(
      "href",
      "/book",
    );
  });

  test("shows the next session and cancels it after confirming", async ({ page }) => {
    await registerMember(page.request);
    await bookSomething(page.request);
    await page.goto("/dashboard");

    await expect(page.getByText("Your next session")).toBeVisible();
    await page.getByRole("button", { name: "Cancel booking" }).click();
    const dialog = page.getByRole("dialog", { name: "Cancel this booking?" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Keep booking" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("Your next session")).toBeVisible();

    await page.getByRole("button", { name: "Cancel booking" }).click();
    await dialog.getByRole("button", { name: "Cancel booking" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Booking cancelled." })).toBeVisible();
    await expect(page.getByText("You have no bookings yet")).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Past and cancelled" })
        .getByText("Cancelled", { exact: true }),
    ).toBeVisible();
  });

  test("past sessions are listed", async ({ page }) => {
    await page.request.post("/api/auth/login", {
      data: { email: "ngozi@example.com", password: "password123" },
    });
    await page.goto("/dashboard");
    const history = page.getByRole("region", { name: "Past and cancelled" });
    await expect(history.getByText("Completed").first()).toBeVisible();
  });

  test("the account menu shows where you are and lets you log out", async ({ page, isMobile }) => {
    await registerMember(page.request);
    await page.goto("/dashboard");
    await openAccountMenu(page, isMobile);
    const nav = page.getByRole("navigation", { name: "Account" }).filter({ visible: true });
    await expect(nav.getByRole("link", { name: "My bookings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Book prayer" })).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("no sideways scroll", async ({ page }) => {
    await registerMember(page.request);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
