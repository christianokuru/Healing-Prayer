import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, RedirectIfLoggedIn, RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create an account" };

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
