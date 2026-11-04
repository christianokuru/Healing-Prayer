import { serializeJsonLd } from "@/lib/seo";

/**
 * Structured data for search engines. The only place `dangerouslySetInnerHTML` is allowed:
 * the data is built by lib/seo.ts from our own content and "<" is escaped.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  if (Array.isArray(data) && data.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
