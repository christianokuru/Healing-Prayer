import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  /** Links under the card, e.g. "No account yet? Create one". */
  footer?: ReactNode;
};

/** One centred card for every auth screen (UI.md section 6.2). */
export function AuthCard({ title, intro, children, footer }: AuthCardProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5 md:p-7">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1">{title}</h1>
          {intro && <div className="text-muted">{intro}</div>}
        </div>
        {children}
      </div>
      {footer && <div className="flex flex-col items-center gap-2 text-center">{footer}</div>}
    </div>
  );
}

export const textLink = "font-bold text-plum underline underline-offset-4 hover:no-underline";
