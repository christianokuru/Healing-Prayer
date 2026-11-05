import { Badge, Card, Eyebrow } from "@/components/ui";
import type { Slot } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDateKeyLong, formatTime } from "@/lib/time";
import type { BookingDay } from "../logic/days";

type SlotButtonProps = {
  slot: Slot;
  timeZone: string;
  weekLocked: boolean;
  selected: boolean;
  flash: boolean;
  onSelect: (start: string) => void;
};

function SlotButton({ slot, timeZone, weekLocked, selected, flash, onSelect }: SlotButtonProps) {
  const time = formatTime(slot.start, timeZone);
  const mine = slot.state === "mine";
  const taken = slot.state === "taken";
  const locked = !mine && !taken && (weekLocked || !slot.bookable);
  const disabled = mine || taken || locked;
  const status = mine ? "Yours" : taken ? "Taken" : locked ? "—" : selected ? "Chosen" : "Free";
  const label = mine
    ? `${time}, your booking`
    : taken
      ? `${time}, taken`
      : locked
        ? `${time}, unavailable${weekLocked ? ", you already have a booking this week" : ""}`
        : `${time}, free`;

  return (
    <button
      type="button"
      data-slot={slot.start}
      disabled={disabled}
      aria-pressed={disabled ? undefined : selected}
      aria-label={label}
      onClick={() => onSelect(slot.start)}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center rounded-sm border-[1.5px] px-1.5 tabular-nums transition-[background-color,border-color,transform] duration-150",
        "border-line bg-bg hover:border-plum active:scale-[0.97] md:active:scale-100",
        selected && "border-plum bg-plum text-plum-ink hover:border-plum",
        disabled &&
          "cursor-not-allowed border-transparent bg-off text-muted hover:border-transparent active:scale-100",
        mine && "bg-gold-soft text-gold",
        flash && "animate-flash",
      )}
    >
      <span
        className={cn(
          "text-[0.9375rem] font-bold whitespace-nowrap md:text-[1.0625rem]",
          taken && "line-through",
        )}
      >
        {time}
      </span>
      <span
        className={cn(
          "text-[0.6875rem] md:text-[0.75rem]",
          selected ? "text-gold-glow" : "text-muted",
          mine && "font-bold text-gold",
        )}
      >
        {status}
      </span>
    </button>
  );
}

type DayCardProps = {
  day: BookingDay;
  timeZone: string;
  selected: string | null;
  flash: string | null;
  onSelect: (start: string) => void;
  /** Two times per row at every width, for the narrow card beside the calendar. */
  compact?: boolean;
};

/** One session day (UI.md section 5, "Day card"). */
export function DayCard({
  day,
  timeZone,
  selected,
  flash,
  onSelect,
  compact = false,
}: DayCardProps) {
  const [weekday, ...rest] = formatDateKeyLong(day.key).split(" ");
  const date = rest.join(" ");
  const total = day.slots.length;

  const badge =
    day.kind === "blocked" ? (
      <Badge>No session</Badge>
    ) : day.kind === "full" ? (
      <Badge tone="plum">Full</Badge>
    ) : day.hasMine ? (
      <Badge tone="gold">Your booking</Badge>
    ) : day.weekBooked ? (
      <Badge>Booked this week</Badge>
    ) : (
      <Badge tone="ok">
        {day.freeCount} of {total} free
      </Badge>
    );

  return (
    <Card
      as="section"
      framed={day.kind !== "blocked"}
      aria-label={formatDateKeyLong(day.key)}
      className={cn(
        "flex flex-col gap-3 md:gap-3.5",
        day.kind === "full" && "bg-plum-soft",
        day.kind === "blocked" && "border-dashed bg-transparent",
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <Eyebrow>{weekday}</Eyebrow>
          <h3 className="text-h3 text-plum">{date}</h3>
        </div>
        {badge}
      </div>

      {day.kind === "blocked" && (
        <p className="relative text-small text-muted">
          <span aria-hidden="true" className="mr-1 text-gold">
            ✠
          </span>
          No prayer session this week{day.blockedReason ? ` (${day.blockedReason})` : ""}.
        </p>
      )}
      {day.kind === "full" && (
        <p className="relative text-small text-muted">
          All {total} times are booked. Please choose another day.
        </p>
      )}
      {day.kind === "open" && day.weekBooked && (
        <p className="relative text-small text-muted">
          You already have a booking this week. You can book one session per week.
        </p>
      )}

      {day.kind === "open" && (
        <div
          className={cn(
            "relative grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 md:grid-cols-2",
            !compact && "lg:grid-cols-4",
          )}
        >
          {day.slots.map((slot) => (
            <SlotButton
              key={slot.start}
              slot={slot}
              timeZone={timeZone}
              weekLocked={day.weekBooked}
              selected={selected === slot.start}
              flash={flash === slot.start}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
