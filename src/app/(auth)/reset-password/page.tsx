import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, ResetPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Choose a new password for your account.",
  alternates: { canonical: "/reset-password" },
  // Account pages stay out of search results; links on them can still be followed.
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Suspense fallback={<AuthSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
