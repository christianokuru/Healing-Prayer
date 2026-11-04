import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Cinzel, Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/ui";
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

export const metadata: Metadata = {
  title: {
    default: "Healing Prayer North-West",
    template: "%s · Healing Prayer North-West",
  },
  description: "Book a one-on-one prayer session with Healing Prayer North-West.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cinzel.variable} ${ebGaramond.variable} ${atkinson.variable}`}
    >
      <body className="min-h-dvh">
        <SmoothScroll />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
