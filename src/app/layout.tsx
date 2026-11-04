import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Lora } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600"],
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
    <html lang="en" className={`${lora.variable} ${atkinson.variable}`}>
      <body className="min-h-dvh">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
