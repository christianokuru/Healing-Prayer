"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Banner, Button, Field, Input, PasswordInput } from "@/components/ui";
import { api } from "@/lib/api";
import { safeNext } from "@/lib/auth/redirects";
import { isApiError, messageFor } from "@/lib/errors";
import { applyFieldErrors } from "@/lib/forms";
import { registerSchema, type RegisterValues } from "../schemas";
import { AuthCard, textLink } from "./AuthCard";

const FIELDS = ["full_name", "email", "phone", "password"] as const;

export function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.auth.register(values);
      router.replace(next ?? "/dashboard");
      router.refresh();
    } catch (error) {
      if (isApiError(error, "EMAIL_TAKEN")) {
        setError("email", { type: "server", message: messageFor(error) }, { shouldFocus: true });
      } else if (!applyFieldErrors(error, setError, FIELDS)) {
        setFormError(messageFor(error));
      }
    }
  });

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthCard
      title="Create an account"
      verse={{
        text: "Ask, and it shall be given you; seek, and ye shall find.",
        reference: "Matthew 7:7",
      }}
      intro="You need an account to book a prayer session."
      footer={
        <p>
          Already have an account?{" "}
          <Link href={loginHref} className={textLink}>
            Log in
          </Link>
        </p>
      }
    >
      {formError && <Banner>{formError}</Banner>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field id="full_name" label="Full name" error={errors.full_name?.message}>
          {(control) => <Input {...control} {...register("full_name")} autoComplete="name" />}
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          {(control) => (
            <Input {...control} {...register("email")} type="email" autoComplete="email" />
          )}
        </Field>
        <Field
          id="phone"
          label="Phone number"
          hint="So the prayer team can reach you about your session."
          error={errors.phone?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register("phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(416) 555-0123"
            />
          )}
        </Field>
        <Field
          id="password"
          label="Password"
          hint={errors.password ? undefined : "At least 8 characters."}
          error={errors.password?.message}
        >
          {(control) => (
            <PasswordInput {...control} {...register("password")} autoComplete="new-password" />
          )}
        </Field>
        <p className="flex gap-2.5 rounded-md bg-plum-soft px-4 py-3 text-small">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 size-4 shrink-0 text-plum"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>
            Only church admins can read your prayer points. Your details are never shown to other
            members.
          </span>
        </p>
        <Button type="submit" block loading={isSubmitting} loadingText="Creating account…">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
