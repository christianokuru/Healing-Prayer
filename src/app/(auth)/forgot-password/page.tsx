import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Get a link to choose a new password.",
  alternates: { canonical: "/forgot-password" },
  // Account pages stay out of search results; links on them can still be followed.
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Suspense fallback={<AuthSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
