"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  Banner,
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  SegmentedToggle,
  Skeleton,
  Textarea,
  useToast,
} from "@/components/ui";

// Visual reference for components/ui in every state (UI.md section 5).

const VIEWS = [
  { value: "list", label: "Upcoming days" },
  { value: "calendar", label: "Calendar" },
] as const;

const PRAYER_MAX = 10_000;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

export function ComponentGallery() {
  const { showToast } = useToast();
  const [view, setView] = useState<(typeof VIEWS)[number]["value"]>("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prayer, setPrayer] = useState("");
  const prayerLength = [...prayer].length;

  function fakeSubmit() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <main className="mx-auto flex max-w-content flex-col gap-12 py-10 gutter lg:py-16">
      <header className="flex flex-col gap-2">
        <p className="text-label text-muted uppercase">Components</p>
        <h1 className="text-h1">Building blocks</h1>
        <p className="max-w-prose text-muted">
          Every shared component in every state. Tap things to try them.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button onClick={fakeSubmit} loading={loading} loadingText="Booking…">
            Confirm booking
          </Button>
          <Button variant="secondary">Back</Button>
          <Button variant="link">Change</Button>
          <Button disabled>Continue</Button>
        </div>
        <Button block className="md:hidden">
          Full-width on phones
        </Button>
      </Section>

      <Section title="Form fields">
        <Card className="flex flex-col gap-5">
          <Field id="demo-email" label="Email" hint="We send your booking confirmation here.">
            {(control) => <Input {...control} type="email" autoComplete="email" />}
          </Field>
          <Field
            id="demo-phone"
            label="Phone number"
            hint="Include the country code, for example +1."
            error="Use digits only, with an optional + at the start."
          >
            {(control) => <Input {...control} type="tel" defaultValue="0801-234-ABC" />}
          </Field>
          <Field
            id="demo-prayer"
            label="What would you like prayer for?"
            hint="Only church admins can read this."
            count={`${prayerLength.toLocaleString()} / ${PRAYER_MAX.toLocaleString()}`}
          >
            {(control) => (
              <Textarea
                {...control}
                value={prayer}
                onChange={(event) => setPrayer(event.target.value)}
                placeholder="For example: healing for my mother."
              />
            )}
          </Field>
        </Card>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="ok">3 of 4 free</Badge>
          <Badge tone="plum">Full</Badge>
          <Badge tone="gold">Your booking</Badge>
          <Badge tone="ok">Completed</Badge>
          <Badge tone="danger">Cancelled</Badge>
          <Badge>No session</Badge>
        </div>
      </Section>

      <Section title="Banners">
        <Banner>Sorry, that time was just taken by someone else. Please pick another time.</Banner>
        <Banner tone="info">
          You already have a booking this week. You can book one session per week.
        </Banner>
      </Section>

      <Section title="Toggle">
        <SegmentedToggle label="View" options={VIEWS} value={view} onChange={setView} />
        <p className="text-small text-muted">
          Showing: {view === "list" ? "Upcoming days" : "Calendar"}
        </p>
      </Section>

      <Section title="Dialog and toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Cancel booking…
          </Button>
          <Button variant="secondary" onClick={() => showToast("Your details were saved.")}>
            Show a toast
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Cancel this booking?"
          actions={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Keep booking
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  showToast("Booking cancelled.");
                }}
              >
                Cancel booking
              </Button>
            </>
          }
        >
          <p>Thursday 12 November, 7:30 – 8:00 PM.</p>
          <p className="text-muted">The time will be free for someone else to book.</p>
        </Dialog>
      </Section>

      <Section title="Cards, loading and empty">
        <div className="grid gap-4 md:grid-cols-2">
          <Card as="article" className="flex flex-col gap-2">
            <p className="text-label text-muted uppercase">Thursday</p>
            <h3 className="text-h2">12 November</h3>
            <p className="text-muted">A card with real content.</p>
          </Card>
          <Card className="flex flex-col gap-3" aria-busy="true">
            <span className="sr-only">Loading…</span>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-full" />
          </Card>
        </div>
        <EmptyState
          title="You have no bookings yet."
          description="Pick a Thursday evening time that suits you."
          action={<Button>Book prayer</Button>}
        />
      </Section>
    </main>
  );
}
