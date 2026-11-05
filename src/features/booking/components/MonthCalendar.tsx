"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { addDays, formatDateKeyLong, formatMonth } from "@/lib/time";
import { monthGrid, monthsBetween, type BookingDay } from "../logic/days";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MonthCalendarProps = {
  days: BookingDay[];
  from: string;
  to: string;
  today: string;
  selectedDay: string | null;
  onSelectDay: (key: string) => void;
};

/**
 * Month grid, Monday first (UI.md section 5, "Calendar"). Only days with sessions are buttons.
 * Arrow keys move between those days; Enter or Space selects.
 */
export function MonthCalendar({
  days,
  from,
  to,
  today,
  selectedDay,
  onSelectDay,
}: MonthCalendarProps) {
  const months = monthsBetween(from, to);
  const startMonth = selectedDay ? `${selectedDay.slice(0, 7)}-01` : (months[0] ?? from);
  const [month, setMonth] = useState(startMonth);
  const gridRef = useRef<HTMLDivElement>(null);
  const byKey = new Map(days.map((d) => [d.key, d]));
  const index = months.indexOf(month);

  function focusDay(key: string) {
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    const current = (event.target as HTMLElement).dataset.day;
    if (!step || !current) return;
    event.preventDefault();
    // Walk in that direction to the next day that has sessions.
    for (let key = addDays(current, step); key >= from && key <= to; key = addDays(key, step)) {
      if (byKey.get(key)?.kind === "open" || byKey.get(key)?.kind === "full") {
        if (`${key.slice(0, 7)}-01` !== month) setMonth(`${key.slice(0, 7)}-01`);
        requestAnimationFrame(() => focusDay(key));
        return;
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3.5 md:p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(months[index - 1] ?? month)}
          disabled={index <= 0}
          aria-label="Previous month"
          className="grid size-11 place-items-center rounded-full border border-line disabled:opacity-35"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <h3 className="text-h3 text-plum" aria-live="polite">
          {formatMonth(month)}
        </h3>
        <button
          type="button"
          onClick={() => setMonth(months[index + 1] ?? month)}
          disabled={index >= months.length - 1}
          aria-label="Next month"
          className="grid size-11 place-items-center rounded-full border border-line disabled:opacity-35"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div
        ref={gridRef}
        role="group"
        aria-label={formatMonth(month)}
        onKeyDown={onKeyDown}
        className="grid grid-cols-7 gap-1"
      >
        {WEEKDAYS.map((d) => (
          <div key={d} aria-hidden="true" className="py-1 text-center text-[0.75rem] text-muted">
            {d}
          </div>
        ))}
        {monthGrid(month).map((cell, i) => {
          if (!cell.inMonth) return <div key={`blank-${i}`} />;
          const day = byKey.get(cell.key);
          const label = formatDateKeyLong(cell.key);
          const isToday = cell.key === today;
          const base =
            "relative grid aspect-square max-w-full place-items-center rounded-[10px] text-[0.9375rem] tabular-nums";
          if (!day || day.kind === "blocked") {
            return (
              <div
                key={cell.key}
                className={cn(
                  base,
                  "text-muted opacity-50",
                  isToday && "outline outline-1 -outline-offset-4 outline-muted outline-dashed",
                )}
                title={day?.blockedReason ? `No session: ${day.blockedReason}` : undefined}
              >
                <span className="sr-only">
                  {label},{" "}
                  {day
                    ? `no session${day.blockedReason ? `, ${day.blockedReason}` : ""}`
                    : "no session"}
                </span>
                <span aria-hidden="true">{cell.day}</span>
              </div>
            );
          }
          const full = day.kind === "full";
          const pressed = selectedDay === cell.key;
          return (
            <button
              key={cell.key}
              type="button"
              data-day={cell.key}
              aria-pressed={pressed}
              aria-label={`${label}, ${full ? "full" : day.hasMine ? "your booking" : `${day.freeCount} times free`}`}
              onClick={() => onSelectDay(cell.key)}
              className={cn(
                base,
                "cursor-pointer border-[1.5px] font-bold",
                full ? "border-transparent bg-plum-soft text-plum" : "border-line bg-bg text-ink",
                !full &&
                  "after:absolute after:bottom-1.5 after:size-1.5 after:rounded-full after:bg-ok",
                day.hasMine && "after:bg-gold",
                pressed && "border-plum ring-2 ring-plum",
                isToday && "outline outline-1 -outline-offset-4 outline-muted outline-dashed",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.75rem] text-muted md:text-small">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-3.5 rounded-[4px] border border-line bg-bg" /> Times free
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-3.5 rounded-[4px] bg-plum-soft" /> Full
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block size-3.5 rounded-[4px] bg-off" /> No session
        </span>
      </div>
    </div>
  );
}
