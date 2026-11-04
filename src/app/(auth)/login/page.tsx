import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, RedirectIfLoggedIn, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Log in" };

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
