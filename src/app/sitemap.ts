import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/** Indexable pages only. Add /book when the booking page exists (MASTER.md next steps). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
}
