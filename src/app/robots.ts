import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/** Public pages are open to search engines; private and technical ones are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/admin", "/dev/", "/reset-password"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
