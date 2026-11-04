import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSkeleton, ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = { title: "Reset your password" };

export default function Page() {
  return (
    <>
      <Suspense fallback={<AuthSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
