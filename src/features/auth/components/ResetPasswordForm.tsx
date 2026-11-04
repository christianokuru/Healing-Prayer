"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Banner, Button, Field, PasswordInput } from "@/components/ui";
import { api } from "@/lib/api";
import { isApiError, messageFor } from "@/lib/errors";
import { applyFieldErrors } from "@/lib/forms";
import { resetPasswordSchema } from "../schemas";
import { AuthCard, textLink } from "./AuthCard";

type Values = z.input<typeof resetPasswordSchema>;

function BadLink() {
  return (
    <AuthCard
      title="This link has expired"
      footer={
        <Link href="/login" className={textLink}>
          Back to log in
        </Link>
      }
    >
      <p>Reset links work once and expire after 1 hour.</p>
      <Link
        href="/forgot-password"
        className="inline-flex min-h-13 items-center justify-center rounded-full bg-plum px-6 font-bold text-plum-ink"
      >
        Send a new link
      </Link>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [badToken, setBadToken] = useState(token === "");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, z.output<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      await api.auth.resetPassword({ token, password });
      setDone(true);
    } catch (error) {
      if (isApiError(error, "INVALID_TOKEN")) setBadToken(true);
      else if (!applyFieldErrors(error, setError, ["password"])) setFormError(messageFor(error));
    }
  });

  if (badToken) return <BadLink />;

  if (done) {
    return (
      <AuthCard title="Password changed">
        <p role="status">You can now log in with your new password.</p>
        <Link
          href="/login"
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-plum px-6 font-bold text-plum-ink"
        >
          Log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      {formError && <Banner>{formError}</Banner>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field
          id="password"
          label="New password"
          hint={errors.password ? undefined : "At least 8 characters."}
          error={errors.password?.message}
        >
          {(control) => (
            <PasswordInput {...control} {...register("password")} autoComplete="new-password" />
          )}
        </Field>
        <Button type="submit" block loading={isSubmitting} loadingText="Saving…">
          Save new password
        </Button>
      </form>
    </AuthCard>
  );
}
