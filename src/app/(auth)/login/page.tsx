import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, RedirectIfLoggedIn, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to book or manage your prayer sessions.",
  alternates: { canonical: "/login" },
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
        <LoginForm />
      </Suspense>
    </>
  );
}
