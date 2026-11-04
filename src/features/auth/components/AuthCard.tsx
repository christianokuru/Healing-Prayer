import type { ReactNode } from "react";
import { Divider, SingleCandle, Verse } from "@/components/ui";

type AuthCardProps = {
  title: string;
  intro?: ReactNode;
  verse?: { text: string; reference: string };
  children: ReactNode;
  /** Links under the card, e.g. "No account yet? Create one". */
  footer?: ReactNode;
};

/** Arch card with a single candle for every auth screen (UI.md section 6.2). */
export function AuthCard({ title, intro, verse, children, footer }: AuthCardProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-[160px_160px_18px_18px] border border-line bg-surface px-5 pt-12 pb-7 frame md:px-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <SingleCandle />
          <h1 className="text-h1 text-plum">{title}</h1>
          {verse && (
            <Verse reference={verse.reference} className="[&_blockquote]:text-muted">
              {verse.text}
            </Verse>
          )}
          {intro && <div className="text-muted">{intro}</div>}
        </div>
        {children}
      </div>
      {footer && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Divider />
          {footer}
        </div>
      )}
    </div>
  );
}

export const textLink = "font-bold text-plum underline underline-offset-4 hover:no-underline";
