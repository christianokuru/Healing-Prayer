"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Banner, SegmentedToggle } from "@/components/ui";
import { api, type PublicBlockedDate, type Slot, type SlotsResponse } from "@/lib/api";
import { loginUrl } from "@/lib/auth/redirects";
import { cn } from "@/lib/cn";
import { isApiError, messageFor } from "@/lib/errors";
import { formatDayShort, formatTime, toDateKey } from "@/lib/time";
import { prayerPointSchema } from "@/lib/validation";
import { useLiveSlots } from "../hooks/useLiveSlots";
import { buildDays } from "../logic/days";
import { DayCard } from "./DayCard";
import { MonthCalendar } from "./MonthCalendar";
import {
  ChoiceBar,
  ChosenTime,
  Confirm,
  PrayerPoint,
  StepHeading,
  StepProgress,
  Success,
  SummaryPanel,
  type Step,
} from "./Steps";

const VIEWS = [
  { value: "list", label: "Upcoming days" },
  { value: "calendar", label: "Calendar" },
] as const;

type View = (typeof VIEWS)[number]["value"];
type Notice = { tone: "error" | "info"; text: string };

export type BookingFlowProps = {
  loggedIn: boolean;
  timeZone: string;
  from: string;
  to: string;
  today: string;
  blockedDates: PublicBlockedDate[];
  initial: SlotsResponse;
  /** A time chosen before logging in, from `/book?slot=…`. */
  preselect: string | null;
};

/**
 * The booking flow (UI.md section 6.3, prd.md section 6): choose a time, write the prayer
 * point, confirm. The prayer point is kept through going back, changing time and SLOT_TAKEN.
 */
export function BookingFlow(props: BookingFlowProps) {
  const { loggedIn, timeZone, from, to, today, blockedDates, initial } = props;
  const router = useRouter();
  const { slots, weekBooked, refresh } = useLiveSlots({ from, to }, initial);
  const days = buildDays({ slots, blockedDates, weekBooked, timeZone, from, to });
  const find = (start: string | null) => (start ? slots.find((s) => s.start === start) : undefined);

  // A time picked before logging in: go straight to the prayer point if it is still free.
  const preselected = find(props.preselect);
  const preselectOk = loggedIn && preselected?.state === "free" && preselected.bookable;

  const [step, setStep] = useState<Step>(preselectOk ? 2 : 1);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<string | null>(
    preselectOk ? (props.preselect ?? null) : null,
  );
  const [calendarDay, setCalendarDay] = useState<string | null>(
    selected ? toDateKey(selected, timeZone) : null,
  );
  const [prayer, setPrayer] = useState("");
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(
    props.preselect && loggedIn && !preselectOk
      ? { tone: "error", text: "That time is no longer available. Please pick another time." }
      : null,
  );
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [booked, setBooked] = useState<Slot | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const selectedSlot = find(selected) ?? null;

  // Someone else took the chosen time while this person was choosing or writing (live polling).
  // Adjusting state during render is React's pattern for "state derived from new props".
  if (selected && step < 4 && !pending && selectedSlot && selectedSlot.state === "taken") {
    setNotice({
      tone: "error",
      text: `Sorry, ${formatDayShort(selected, timeZone)} at ${formatTime(selected, timeZone)} was just taken by someone else.${prayer.trim() ? " Your prayer point is saved." : ""} Please pick another time.`,
    });
    setFlash(selected);
    setSelected(null);
    setStep(1);
  }

  // Move focus to the new step's heading so keyboard and screen reader users follow along.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  function choose(start: string) {
    setNotice(null);
    setFlash(null);
    setSelected((current) => (current === start ? null : start));
  }

  function continueFromTimes() {
    if (!selected) return;
    if (!loggedIn) {
      router.push(loginUrl(`/book?slot=${encodeURIComponent(selected)}`));
      return;
    }
    setStep(2);
  }

  function continueFromPrayer() {
    const result = prayerPointSchema.safeParse(prayer);
    if (!result.success) {
      setPrayerError(result.error.issues[0]?.message ?? "Write your prayer point.");
      return;
    }
    setPrayerError(null);
    setStep(3);
  }

  async function confirm() {
    if (!selectedSlot) return;
    setPending(true);
    setNotice(null);
    try {
      await api.appointments.create({ slot_start: selectedSlot.start, prayer_point: prayer });
      setBooked(selectedSlot);
      setStep(4);
      void refresh();
    } catch (error) {
      if (isApiError(error, "UNAUTHENTICATED")) {
        router.push(loginUrl(`/book?slot=${encodeURIComponent(selectedSlot.start)}`));
        return;
      }
      if (isApiError(error, "SLOT_TAKEN") || isApiError(error, "INVALID_SLOT")) {
        setFlash(selectedSlot.start);
        setSelected(null);
        setStep(1);
      }
      if (isApiError(error, "INVALID_INPUT") && error.fields?.prayer_point) {
        setPrayerError(error.fields.prayer_point);
        setStep(2);
      }
      setNotice({ tone: "error", text: messageFor(error) });
      void refresh();
    } finally {
      setPending(false);
    }
  }

  function startAgain() {
    setBooked(null);
    setSelected(null);
    setPrayer("");
    setNotice({
      tone: "info",
      text: "Your booking is marked in gold. You can book one session per week.",
    });
    setStep(1);
  }

  const visibleDays = view === "calendar" ? days.filter((d) => d.key === calendarDay) : days;
  const openDays = days.filter((d) => d.kind !== "blocked");

  return (
    <div className="mx-auto grid max-w-content gap-5 pt-2 gutter pb-36 md:gap-7 md:pt-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-9 lg:pb-16">
      <div className="flex min-w-0 flex-col gap-5 md:gap-6">
        <StepProgress step={step} />

        <div aria-live="polite">{notice && <Banner tone={notice.tone}>{notice.text}</Banner>}</div>

        {step === 1 && (
          <>
            <div className="flex flex-col gap-3">
              <StepHeading ref={headingRef}>Choose a time</StepHeading>
              <SegmentedToggle label="View" options={VIEWS} value={view} onChange={setView} />
            </div>
            {openDays.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-muted">
                There are no session times in the next few weeks. Please check back soon.
              </p>
            ) : view === "calendar" ? (
              <div className="grid gap-4 md:grid-cols-2 md:items-start lg:grid-cols-[400px_1fr]">
                <MonthCalendar
                  days={days}
                  from={from}
                  to={to}
                  today={today}
                  selectedDay={calendarDay}
                  onSelectDay={setCalendarDay}
                />
                {visibleDays.length === 0 ? (
                  <p className="p-2 text-center text-small text-muted">
                    Tap a highlighted day to see its times.
                  </p>
                ) : (
                  visibleDays.map((day) => (
                    <DayCard
                      compact
                      key={day.key}
                      day={day}
                      timeZone={timeZone}
                      selected={selected}
                      flash={flash}
                      onSelect={choose}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="grid gap-3.5 md:grid-cols-2 md:gap-4 lg:grid-cols-1">
                {visibleDays.map((day) => (
                  <DayCard
                    key={day.key}
                    day={day}
                    timeZone={timeZone}
                    selected={selected}
                    flash={flash}
                    onSelect={choose}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {step === 2 && selectedSlot && (
          <>
            <StepHeading ref={headingRef}>Your prayer point</StepHeading>
            <ChosenTime slot={selectedSlot} timeZone={timeZone} onChange={() => setStep(1)} />
            <PrayerPoint
              value={prayer}
              error={prayerError}
              onChange={(value) => {
                setPrayer(value);
                if (prayerError) setPrayerError(null);
              }}
              onBack={() => setStep(1)}
              onContinue={continueFromPrayer}
            />
          </>
        )}

        {step === 3 && selectedSlot && (
          <>
            <StepHeading ref={headingRef}>Check and confirm</StepHeading>
            <Confirm
              slot={selectedSlot}
              timeZone={timeZone}
              prayer={prayer}
              pending={pending}
              onEditPrayer={() => setStep(2)}
              onBack={() => setStep(2)}
              onConfirm={confirm}
            />
          </>
        )}

        {step === 4 && booked && (
          <Success ref={headingRef} slot={booked} timeZone={timeZone} onAgain={startAgain} />
        )}
      </div>

      <div className={cn(step === 4 && "lg:hidden")}>
        <SummaryPanel
          slot={step < 4 ? selectedSlot : null}
          timeZone={timeZone}
          showContinue={step === 1}
          onContinue={continueFromTimes}
        />
      </div>

      {step === 1 && (
        <ChoiceBar slot={selectedSlot} timeZone={timeZone} onContinue={continueFromTimes} />
      )}
    </div>
  );
}
