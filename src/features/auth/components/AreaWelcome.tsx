import { ArchCard, Eyebrow, Verse } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { LogoutButton } from "./LogoutButton";

/** Temporary landing content for /dashboard and /admin until those screens are built. */
export async function AreaWelcome({ title, next }: { title: string; next: string }) {
  const user = await getSession();
  return (
    <div className="mx-auto flex max-w-content flex-col gap-8 py-10 gutter">
      <div className="flex flex-col gap-2">
        <Eyebrow>{title}</Eyebrow>
        <h1 className="text-h1 text-plum">Peace be with you, {user?.full_name.split(" ")[0]}</h1>
      </div>
      <ArchCard className="max-w-[560px]">
        <Eyebrow>Coming soon</Eyebrow>
        <p className="font-display text-h3 text-plum">{next}</p>
        <Verse reference="Philippians 4:6" className="max-w-[34ch] [&_blockquote]:text-muted">
          In every thing by prayer and supplication with thanksgiving let your requests be made
          known unto God.
        </Verse>
        <LogoutButton />
      </ArchCard>
    </div>
  );
}
