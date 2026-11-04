import { expect, test } from "@playwright/test";

// The mock API runs inside the Next.js server in mock mode (ENGINEERING.md section 4).
test.describe("mock API", () => {
  test.skip(({ isMobile }) => isMobile, "API checks do not depend on screen size");

  test("health and public schedule answer", async ({ request }) => {
    expect(await (await request.get("/api/health")).json()).toEqual({ ok: true });
    const schedule = await (await request.get("/api/schedule")).json();
    expect(schedule).toMatchObject({ timezone: "America/Toronto", booking_window_weeks: 8 });
    expect(schedule.rules[0]).toMatchObject({ weekday: 4, start_time: "19:00" });
  });

  test("login sets an httpOnly cookie that later requests use", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { email: "ngozi@example.com", password: "password123" },
    });
    expect(login.status()).toBe(200);
    expect(login.headers()["set-cookie"]).toContain("HttpOnly");
    const me = await (await request.get("/api/auth/me")).json();
    expect(me.user.full_name).toBe("Ngozi Okafor");
  });

  test("errors use the shared shape", async ({ request }) => {
    const res = await request.get("/api/appointments/mine");
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: expect.any(String) },
    });
  });
});
