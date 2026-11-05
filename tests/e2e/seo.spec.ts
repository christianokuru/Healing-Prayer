import { expect, test } from "@playwright/test";

// Search and share metadata (ENGINEERING.md, "SEO"). Not screen-size dependent.
test.describe("SEO", () => {
  test.skip(({ isMobile }) => isMobile, "Metadata does not depend on screen size");

  test("homepage has title, description, canonical, share tags and language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Healing Prayer North-West · Book a one-on-one prayer session");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-CA");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /one-on-one prayer/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$|vercel\.app$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_CA");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("homepage structured data describes the church and website, without placeholder contacts", async ({
    page,
  }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const items = blocks.flatMap((text) => [JSON.parse(text)].flat());
    const church = items.find((item) => item["@type"] === "Church");
    expect(church).toMatchObject({ name: "Healing Prayer North-West" });
    expect(church.potentialAction["@type"]).toBe("ReserveAction");
    expect(church).not.toHaveProperty("address");
    expect(items.some((item) => item["@type"] === "WebSite")).toBe(true);
  });

  test("account pages are kept out of search results", async ({ page }) => {
    for (const path of ["/login", "/register", "/forgot-password", "/reset-password"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
        "content",
        "noindex, follow",
      );
    }
  });

  test("robots.txt, sitemap, manifest and share image are served", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /dashboard");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<urlset");
    expect(sitemap).toContain("/book</loc>");

    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest).toMatchObject({ name: "Healing Prayer North-West", display: "standalone" });
    expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBe(
      true,
    );

    const image = await request.get("/opengraph-image");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");

    const api = await request.get("/api/health");
    expect(api.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  });
});
