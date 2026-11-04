import type { MetadataRoute } from "next";
import { CHURCH } from "@/lib/church";

/** Lets people add the site to their phone's home screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CHURCH.name,
    short_name: CHURCH.shortName,
    description: CHURCH.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6efe3",
    theme_color: "#24142f",
    lang: "en-CA",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Book prayer", url: "/book", description: "Choose a time to be prayed with" },
    ],
  };
}
