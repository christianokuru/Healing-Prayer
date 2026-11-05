"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner, Button, Dialog, useToast, type ButtonVariant } from "@/components/ui";
import { api } from "@/lib/api";
import { messageFor } from "@/lib/errors";

type CancelBookingProps = {
  id: string;
  /** "Thursday 12 November, 7:00 – 7:30 PM" */
  when: string;
  variant?: ButtonVariant;
};

/** Cancel with a confirmation sheet. The time becomes free for someone else straight away. */
export function CancelBooking({ id, when, variant = "secondary" }: CancelBookingProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      await api.appointments.cancel(id);
      setOpen(false);
      showToast("Booking cancelled.");
      router.refresh();
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Keep booking
            </Button>
            <Button onClick={cancel} loading={pending} loadingText="Cancelling…">
              Cancel booking
            </Button>
          </>
        }
      >
        {error && <Banner>{error}</Banner>}
        <p className="font-bold">{when}</p>
        <p className="text-muted">The time will be free for someone else to book.</p>
      </Dialog>
    </>
  );
}
