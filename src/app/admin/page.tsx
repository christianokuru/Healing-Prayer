import type { Metadata } from "next";
import { AreaWelcome } from "@/features/auth";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return <AreaWelcome title="Admin" next="Bookings and the schedule will appear here soon." />;
}
