"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Banner, Button, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { forgotPasswordSchema } from "../schemas";
import { AuthCard, textLink } from "./AuthCard";

type Values = z.input<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, z.output<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await api.auth.forgotPassword(email);
      setSentTo(email);
    } catch (error) {
      setFormError(messageFor(error));
    }
  });

  const footer = (
    <Link href="/login" className={textLink}>
      Back to log in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthCard title="Check your email" footer={footer}>
        <div role="status" className="flex flex-col gap-3">
          <p>
            If an account exists for <b className="break-words">{sentTo}</b>, we have sent a link to
            reset your password.
          </p>
          <p className="text-muted">
            The link works once and expires after 1 hour. Check your spam folder if it does not
            arrive in a few minutes.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      verse={{
        text: "The Lord is nigh unto them that are of a broken heart.",
        reference: "Psalm 34:18",
      }}
      intro="Enter the email you signed up with. We will send you a link to choose a new password."
      footer={footer}
    >
      {formError && <Banner>{formError}</Banner>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field id="email" label="Email" error={errors.email?.message}>
          {(control) => (
            <Input {...control} {...register("email")} type="email" autoComplete="email" />
          )}
        </Field>
        <Button type="submit" block loading={isSubmitting} loadingText="Sending…">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
