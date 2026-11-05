import { expect, test, type Page } from "@playwright/test";

const MEMBER = { email: "ngozi@example.com", password: "password123" };
const ADMIN = { email: "admin@example.com", password: "admin12345" };

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

async function logIn(page: Page, account: { email: string; password: string }) {
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test.describe("guards", () => {
  test("a visitor opening /dashboard is sent to login and back after logging in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await logIn(page, MEMBER);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Peace be with you, Ngozi" })).toBeVisible();
  });

  test("a member opening /admin is turned away to /dashboard", async ({ page }) => {
    await page.goto("/login");
    await logIn(page, MEMBER);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("an admin lands on /admin after logging in", async ({ page }) => {
    await page.goto("/login");
    await logIn(page, ADMIN);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Peace be with you, Pastor" })).toBeVisible();
  });

  test("a logged-in member opening /login goes to their dashboard", async ({ page }) => {
    await page.request.post("/api/auth/login", { data: MEMBER });
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("login ignores next links to other sites", async ({ page }) => {
    await page.goto("/login?next=//evil.example.com");
    await logIn(page, MEMBER);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("register, log out and log in", () => {
  test("creates an account, logs out, and logs back in", async ({ page, isMobile }) => {
    const email = uniqueEmail();
    await page.goto("/register");
    await expect(page.getByText(/Only church admins can read your prayer points/)).toBeVisible();
    await page.getByLabel("Full name").fill("Amara Obi");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Phone number").fill("(416) 555-0199");
    await page.getByLabel("Password", { exact: true }).fill("longenough");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Peace be with you, Amara" })).toBeVisible();

    // Log out sits in the sidebar on desktop and in the account menu on phones.
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: "Log out" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, { email, password: "longenough" });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("shows field errors before sending and server errors after", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");

    await page.getByLabel("Full name").fill("Someone");
    await page.getByLabel("Email").fill(MEMBER.email);
    await page.getByLabel("Phone number").fill("4165550000");
    await page.getByLabel("Password", { exact: true }).fill("longenough");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/An account with this email already exists/)).toBeVisible();
  });

  test("wrong password shows a clear message", async ({ page }) => {
    await page.goto("/login");
    await logIn(page, { email: MEMBER.email, password: "wrong-password" });
    await expect(
      page.getByRole("alert").filter({ hasText: "Wrong email or password." }),
    ).toBeVisible();
  });

  test("the Show button reveals the password", async ({ page }) => {
    await page.goto("/login");
    const field = page.getByLabel("Password", { exact: true });
    await expect(field).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(field).toHaveAttribute("type", "text");
  });
});

test.describe("password reset", () => {
  test("sends a link, sets a new password once, then logs in with it", async ({ page }) => {
    const email = uniqueEmail();
    await page.request.post("/api/auth/register", {
      data: { full_name: "Reset Tester", email, phone: "4165550111", password: "oldpassword" },
    });
    await page.request.post("/api/auth/logout");

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    const { token } = await (
      await page.request.get(`/api/__mock/reset-token?email=${email}`)
    ).json();
    await page.goto(`/reset-password?token=${token}`);
    await page.getByLabel("New password").fill("newpassword");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByRole("heading", { name: "Password changed" })).toBeVisible();

    await page.goto(`/reset-password?token=${token}`);
    await page.getByLabel("New password").fill("anotherone");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();

    await page.goto("/login");
    await logIn(page, { email, password: "newpassword" });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a reset page without a token explains what to do", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("link", { name: "Send a new link" })).toBeVisible();
  });
});
