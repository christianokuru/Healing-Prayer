import { getSession } from "@/lib/auth/getSession";
import { LogoutButton } from "./LogoutButton";

/** Temporary landing content for /dashboard and /admin until those screens are built. */
export async function AreaWelcome({ title, next }: { title: string; next: string }) {
  const user = await getSession();
  return (
    <div className="mx-auto flex max-w-dashboard flex-col gap-4 py-12 gutter">
      <p className="text-label text-muted uppercase">{title}</p>
      <h1 className="text-h1">Welcome, {user?.full_name.split(" ")[0]}</h1>
      <p className="text-muted">{next}</p>
      <div>
        <LogoutButton />
      </div>
    </div>
  );
}
