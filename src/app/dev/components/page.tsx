import type { Metadata } from "next";
import { ComponentGallery } from "@/features/design-system";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

export default function ComponentsPage() {
  return <ComponentGallery />;
}
