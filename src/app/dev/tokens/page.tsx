import type { Metadata } from "next";
import { TokenSheet } from "@/features/design-system";

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

export default function TokensPage() {
  return <TokenSheet />;
}
