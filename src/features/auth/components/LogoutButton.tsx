"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { messageFor } from "@/lib/errors";

export function LogoutButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await api.auth.logout();
      router.replace("/");
      router.refresh();
      showToast("You are logged out.");
    } catch (error) {
      showToast(messageFor(error));
      setPending(false);
    }
  }

  return (
    <Button variant="secondary" onClick={logout} loading={pending} loadingText="Logging out…">
      Log out
    </Button>
  );
}
