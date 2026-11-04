import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, RedirectIfLoggedIn, RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to book a one-on-one prayer session.",
  alternates: { canonical: "/register" },
  // Account pages stay out of search results; links on them can still be followed.
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <Suspense fallback={<AuthSkeleton />}>
        <RegisterForm />
      </Suspense>
    </>
  );
}
