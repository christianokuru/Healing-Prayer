"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Banner, Button, Field, Input, PasswordInput } from "@/components/ui";
import { api } from "@/lib/api";
import { homeFor, safeNext } from "@/lib/auth/redirects";
import { messageFor } from "@/lib/errors";
import { loginSchema, type LoginValues } from "../schemas";
import { AuthCard, textLink } from "./AuthCard";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await api.auth.login(values);
      router.replace(next ?? homeFor(user));
      router.refresh();
    } catch (error) {
      setFormError(messageFor(error));
    }
  });

  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <AuthCard
      title="Log in"
      intro={next === "/book" ? "Log in to finish booking your prayer session." : undefined}
      footer={
        <p>
          No account yet?{" "}
          <Link href={registerHref} className={textLink}>
            Create one
          </Link>
        </p>
      }
    >
      {formError && <Banner>{formError}</Banner>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field id="email" label="Email" error={errors.email?.message}>
          {(control) => (
            <Input {...control} {...register("email")} type="email" autoComplete="email" />
          )}
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password?.message}
          hint={
            <Link href="/forgot-password" className={textLink}>
              Forgot your password?
            </Link>
          }
        >
          {(control) => (
            <PasswordInput {...control} {...register("password")} autoComplete="current-password" />
          )}
        </Field>
        <Button type="submit" block loading={isSubmitting} loadingText="Logging in…">
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
