import type { Metadata } from "next";
import { AreaWelcome } from "@/features/auth";

export const metadata: Metadata = { title: "My bookings" };

export default function DashboardPage() {
  return <AreaWelcome title="My bookings" next="Your bookings will appear here soon." />;
}
