import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Cinzel, Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/ui";
import { CHURCH } from "@/lib/church";
import { SITE_URL } from "@/lib/config";
import "lenis/dist/lenis.css";
import "./globals.css";

// Fonts and roles: UI.md section 3.2. Only the weights listed there.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Site-wide search and share metadata (ENGINEERING.md, "SEO"). Pages override title,
// description, canonical and robots as needed.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${CHURCH.name} · Book a one-on-one prayer session`,
    template: `%s · ${CHURCH.name}`,
  },
  description: CHURCH.description,
  applicationName: CHURCH.name,
  authors: [{ name: CHURCH.name, url: SITE_URL }],
  creator: CHURCH.name,
  publisher: CHURCH.name,
  category: "religion",
  keywords: [
    "prayer",
    "healing prayer",
    "one-on-one prayer",
    "prayer session",
    "book prayer",
    "church",
    "prayer ministry",
    "Canada",
    CHURCH.name,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: CHURCH.name,
    locale: "en_CA",
    url: "/",
    title: `${CHURCH.name} · Bring what is on your heart`,
    description: CHURCH.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${CHURCH.name} · Bring what is on your heart`,
    description: CHURCH.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  appleWebApp: { capable: true, title: CHURCH.shortName, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: true, email: true, address: true },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#24142f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${cormorant.variable} ${cinzel.variable} ${ebGaramond.variable} ${atkinson.variable}`}
    >
      <body className="min-h-dvh">
        <SmoothScroll />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
