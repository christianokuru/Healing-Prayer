import { ApiError, messageFor } from "../errors";
import { createSend } from "./client";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterAll(() => vi.unstubAllGlobals());

describe("createSend", () => {
  it("builds the URL, sends JSON with cookies and returns the body", async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: true }));
    const send = createSend();
    await expect(send("/slots", { query: { from: "2026-11-05", to: undefined } })).resolves.toEqual(
      {
        ok: true,
      },
    );
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/slots?from=2026-11-05");
    expect(init).toMatchObject({ method: "GET", credentials: "include", cache: "no-store" });
  });

  it("forwards the cookie and origin on the server", async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    await createSend({ origin: "http://127.0.0.1:8000", cookie: "hp_session=abc" })("/auth/me");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://127.0.0.1:8000/api/auth/me");
    expect(init.headers.Cookie).toBe("hp_session=abc");
  });

  it("returns undefined for 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(createSend()("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("throws a typed ApiError from the shared error shape", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: "SLOT_TAKEN", message: "That slot was just taken." } },
        { status: 409 },
      ),
    );
    const error = await createSend()("/appointments", { method: "POST", body: {} }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "SLOT_TAKEN", status: 409 });
    expect(messageFor(error)).toMatch(/just taken/);
  });

  it("keeps field errors", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: "INVALID_INPUT", message: "x", fields: { phone: "Bad phone" } } },
        { status: 422 },
      ),
    );
    await expect(
      createSend()("/auth/register", { method: "POST", body: {} }),
    ).rejects.toMatchObject({
      fields: { phone: "Bad phone" },
    });
  });

  it("turns network failures and odd responses into NETWORK_ERROR and UNKNOWN", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    await expect(createSend()("/health")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    fetchMock.mockResolvedValueOnce(new Response("<html>502</html>", { status: 502 }));
    await expect(createSend()("/health")).rejects.toMatchObject({ code: "UNKNOWN", status: 502 });
  });
});
