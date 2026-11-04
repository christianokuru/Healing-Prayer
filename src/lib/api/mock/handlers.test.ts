// @vitest-environment node
import { handleMockRequest, SESSION_COOKIE } from "./handlers";
import { createSeedStore, DEMO_ACCOUNTS, type MockStore } from "./store";

const NOW = new Date("2026-11-04T15:00:00Z"); // Wednesday; next Thursday is 5 November
// Seed: 5 Nov has 7:00 PM taken; 12 Nov is full; 19 Nov has 8:00 PM taken.
const THU_5_730PM = "2026-11-06T00:30:00.000Z";
const THU_5_8PM = "2026-11-06T01:00:00.000Z";
const THU_12_7PM = "2026-11-13T00:00:00.000Z";
const THU_19_7PM = "2026-11-20T00:00:00.000Z";

let store: MockStore;
beforeEach(() => {
  store = createSeedStore(NOW);
});

async function call(method: string, path: string, init: { body?: unknown; cookie?: string } = {}) {
  const url = new URL(`http://test/api/${path}`);
  const request = new Request(url, {
    method,
    headers: {
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(init.cookie ? { Cookie: init.cookie } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const response = await handleMockRequest(request, url.pathname.slice(5).split("/"), store, NOW);
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
    setCookie: response.headers.get("set-cookie"),
  };
}

async function loginAs(account: { email: string; password: string }): Promise<string> {
  const res = await call("POST", "auth/login", { body: account });
  expect(res.status).toBe(200);
  const token = res.setCookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return `${SESSION_COOKIE}=${token}`;
}

describe("auth", () => {
  it("registers, sets a session cookie and normalises input", async () => {
    const res = await call("POST", "auth/register", {
      body: {
        full_name: "Amara Obi",
        email: "Amara@Example.com",
        phone: "(416) 555-0199",
        password: "longenough",
      },
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: "amara@example.com",
      phone: "4165550199",
      role: "user",
    });
    expect(res.body.user.password).toBeUndefined();
    expect(res.setCookie).toContain("HttpOnly");
  });

  it("returns field errors in the shared shape", async () => {
    const res = await call("POST", "auth/register", {
      body: { full_name: "", email: "nope", phone: "abc", password: "short" },
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("INVALID_INPUT");
    expect(Object.keys(res.body.error.fields).sort()).toEqual([
      "email",
      "full_name",
      "password",
      "phone",
    ]);
  });

  it("rejects a taken email and wrong passwords", async () => {
    const taken = await call("POST", "auth/register", {
      body: {
        full_name: "N",
        email: DEMO_ACCOUNTS.member.email,
        phone: "4165550000",
        password: "longenough",
      },
    });
    expect(taken.body.error.code).toBe("EMAIL_TAKEN");
    const wrong = await call("POST", "auth/login", {
      body: { email: DEMO_ACCOUNTS.member.email, password: "wrong" },
    });
    expect([wrong.status, wrong.body.error.code]).toEqual([401, "INVALID_CREDENTIALS"]);
  });

  it("knows who is logged in, and forgets after logout", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    expect((await call("GET", "auth/me", { cookie })).body.user.full_name).toBe("Ngozi Okafor");
    expect((await call("POST", "auth/logout", { cookie })).status).toBe(204);
    expect((await call("GET", "auth/me", { cookie })).body.error.code).toBe("UNAUTHENTICATED");
  });

  it("resets a password once with a valid token", async () => {
    expect(
      (await call("POST", "auth/forgot-password", { body: { email: "nobody@x.com" } })).status,
    ).toBe(204);
    await call("POST", "auth/forgot-password", { body: { email: DEMO_ACCOUNTS.member.email } });
    const { token } = (await call("GET", `__mock/reset-token?email=${DEMO_ACCOUNTS.member.email}`))
      .body;
    expect(
      (await call("POST", "auth/reset-password", { body: { token, password: "newpassword" } }))
        .status,
    ).toBe(204);
    const again = await call("POST", "auth/reset-password", {
      body: { token, password: "another1" },
    });
    expect(again.body.error.code).toBe("INVALID_TOKEN");
    await loginAs({ email: DEMO_ACCOUNTS.member.email, password: "newpassword" });
  });
});

describe("slots", () => {
  it("validates the range", async () => {
    const res = await call("GET", "slots?from=2026-11-01&to=2027-02-01");
    expect(res.body.error).toMatchObject({
      code: "INVALID_INPUT",
      fields: { to: expect.any(String) },
    });
  });

  it("shows seeded bookings as taken to visitors", async () => {
    const res = await call("GET", "slots?from=2026-11-12&to=2026-11-12");
    expect(res.body.slots.map((s: { state: string }) => s.state)).toEqual([
      "taken",
      "taken",
      "taken",
      "taken",
    ]);
    expect(res.body.week_booked).toEqual([]);
  });
});

describe("booking", () => {
  it("books a free slot, then blocks a second booking that week", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    const ok = await call("POST", "appointments", {
      cookie,
      body: { slot_start: THU_5_730PM, prayer_point: "Strength for my family." },
    });
    expect(ok.status).toBe(201);
    expect(ok.body.appointment).toMatchObject({ slot_start: THU_5_730PM, status: "booked" });

    const second = await call("POST", "appointments", {
      cookie,
      body: { slot_start: THU_5_8PM, prayer_point: "Again" },
    });
    expect(second.body.error.code).toBe("WEEKLY_LIMIT");

    const slots = await call("GET", "slots?from=2026-11-05&to=2026-11-05", { cookie });
    expect(slots.body.slots.find((s: { start: string }) => s.start === THU_5_730PM).state).toBe(
      "mine",
    );
    expect(slots.body.week_booked).toEqual(["2026-11-02"]);
  });

  it("returns SLOT_TAKEN when someone else has the slot", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    const res = await call("POST", "appointments", {
      cookie,
      body: { slot_start: THU_12_7PM, prayer_point: "Please" },
    });
    expect([res.status, res.body.error.code]).toEqual([409, "SLOT_TAKEN"]);
  });

  it("rejects times that are not slots, in the past or beyond the window", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    for (const slot_start of [
      "2026-11-06T00:10:00.000Z", // 7:10 PM, not a slot start
      "2026-11-10T00:00:00.000Z", // a Monday
      "2026-10-30T00:00:00.000Z", // past
      "2027-03-05T00:00:00.000Z", // beyond 8 weeks
    ]) {
      const res = await call("POST", "appointments", {
        cookie,
        body: { slot_start, prayer_point: "x" },
      });
      expect(res.body.error.code, slot_start).toBe("INVALID_SLOT");
    }
  });

  it("requires login and a prayer point", async () => {
    const anon = await call("POST", "appointments", {
      body: { slot_start: THU_19_7PM, prayer_point: "x" },
    });
    expect(anon.body.error.code).toBe("UNAUTHENTICATED");
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    const empty = await call("POST", "appointments", {
      cookie,
      body: { slot_start: THU_19_7PM, prayer_point: "  " },
    });
    expect(empty.body.error.fields.prayer_point).toBeDefined();
  });

  it("lets the owner cancel, which frees the slot for someone else", async () => {
    const ngozi = await loginAs(DEMO_ACCOUNTS.member);
    const { appointment } = (
      await call("POST", "appointments", {
        cookie: ngozi,
        body: { slot_start: THU_19_7PM, prayer_point: "Thanks" },
      })
    ).body;

    const samuel = await loginAs({ email: "samuel@example.com", password: "password123" });
    const notOwner = await call("POST", `appointments/${appointment.id}/cancel`, {
      cookie: samuel,
    });
    expect(notOwner.body.error.code).toBe("FORBIDDEN");

    const cancelled = await call("POST", `appointments/${appointment.id}/cancel`, {
      cookie: ngozi,
    });
    expect(cancelled.body.appointment.status).toBe("cancelled");
    const twice = await call("POST", `appointments/${appointment.id}/cancel`, { cookie: ngozi });
    expect(twice.body.error.code).toBe("INVALID_STATE");

    const rebook = await call("POST", "appointments", {
      cookie: samuel,
      body: { slot_start: THU_19_7PM, prayer_point: "Mine now" },
    });
    expect(rebook.status).toBe(201);
  });

  it("lists my bookings: upcoming soonest first, then past", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    await call("POST", "appointments", {
      cookie,
      body: { slot_start: THU_19_7PM, prayer_point: "x" },
    });
    const res = await call("GET", "appointments/mine", { cookie });
    expect(res.body.appointments.map((a: { status: string }) => a.status)).toEqual([
      "booked",
      "completed",
    ]);
  });
});

describe("admin", () => {
  it("is closed to members", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.member);
    expect((await call("GET", "admin/appointments", { cookie })).body.error.code).toBe("FORBIDDEN");
  });

  it("lists with member details, filters and paging", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.admin);
    const res = await call("GET", "admin/appointments?status=booked&page_size=2", { cookie });
    expect(res.body).toMatchObject({ page: 1, page_size: 2, total: 6 });
    expect(res.body.appointments[0].user).toMatchObject({ full_name: "Samuel Adeyemi" });
    const day = await call("GET", "admin/appointments?from=2026-11-12&to=2026-11-12", { cookie });
    expect(day.body.total).toBe(4);
  });

  it("marks a booking completed, only once", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.admin);
    const ok = await call("PATCH", "admin/appointments/a_1", {
      cookie,
      body: { status: "completed" },
    });
    expect(ok.body.appointment.status).toBe("completed");
    const again = await call("PATCH", "admin/appointments/a_1", {
      cookie,
      body: { status: "cancelled" },
    });
    expect(again.body.error.code).toBe("INVALID_STATE");
  });

  it("checks rules for shape and overlap", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.admin);
    const rule = {
      weekday: 4,
      start_time: "20:00",
      end_time: "22:00",
      slot_minutes: 30,
      active: true,
    };
    expect(
      (await call("POST", "admin/schedule/rules", { cookie, body: rule })).body.error.code,
    ).toBe("SCHEDULE_CONFLICT");
    const uneven = { ...rule, weekday: 2, start_time: "10:00", end_time: "10:50" };
    expect(
      (await call("POST", "admin/schedule/rules", { cookie, body: uneven })).body.error.fields
        .end_time,
    ).toBeDefined();
    const tuesday = {
      ...rule,
      weekday: 2,
      start_time: "10:00",
      end_time: "11:00",
      slot_minutes: 20,
    };
    expect((await call("POST", "admin/schedule/rules", { cookie, body: tuesday })).status).toBe(
      201,
    );
    const slots = await call("GET", "slots?from=2026-11-10&to=2026-11-10");
    expect(slots.body.slots).toHaveLength(3);
  });

  it("previews how many future bookings a change would leave outside the schedule", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.admin);
    const off = await call("POST", "admin/schedule/preview", {
      cookie,
      body: { action: "update_rule", id: "r_thursday", active: false },
    });
    expect(off.body.affected_count).toBe(6);
    const shorter = await call("POST", "admin/schedule/preview", {
      cookie,
      body: { action: "update_rule", id: "r_thursday", end_time: "20:00" },
    });
    expect(shorter.body.affected_ids.sort()).toEqual(["a_4", "a_5", "a_6"]);
    const block = await call("POST", "admin/schedule/preview", {
      cookie,
      body: { action: "add_blocked_date", date: "2026-11-12" },
    });
    expect(block.body.affected_count).toBe(4);
    // A preview changes nothing.
    expect((await call("GET", "admin/schedule", { cookie })).body.rules[0].active).toBe(true);
  });

  it("changing the schedule never cancels bookings", async () => {
    const cookie = await loginAs(DEMO_ACCOUNTS.admin);
    await call("PATCH", "admin/schedule/rules/r_thursday", { cookie, body: { active: false } });
    const slots = await call("GET", "slots?from=2026-11-12&to=2026-11-12");
    expect(slots.body.slots).toHaveLength(4);
    expect(slots.body.slots.every((s: { state: string }) => s.state === "taken")).toBe(true);
  });
});

it("returns NOT_FOUND for unknown endpoints", async () => {
  const res = await call("GET", "nope");
  expect([res.status, res.body.error.code]).toEqual([404, "NOT_FOUND"]);
});
