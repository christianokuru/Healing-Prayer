import { Wordmark } from "@/features/site-shell";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center py-6 gutter md:py-16">
      <main className="flex w-full max-w-form flex-col items-center gap-5 md:gap-8">
        <Wordmark />
        {children}
      </main>
    </div>
  );
}
