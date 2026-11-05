// API types, written by hand from ISAAC.md / prd.md section 8.
// Replace with types generated from the backend's OpenAPI schema in Phase 2.

export type Role = "user" | "admin";

export type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
};

export type AppointmentStatus = "booked" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  prayer_point: string;
  created_at: string;
};

export type AdminAppointment = Appointment & {
  cancelled_by: "member" | "admin" | null;
  user: Pick<User, "id" | "full_name" | "email" | "phone">;
};

export type SlotState = "free" | "taken" | "mine";

export type Slot = {
  start: string;
  end: string;
  state: SlotState;
  bookable: boolean;
};

export type SlotsResponse = {
  slots: Slot[];
  /** Monday date keys of weeks where the logged-in member already has a booking. */
  week_booked: string[];
};

export type SlotMinutes = 15 | 20 | 30 | 45 | 60;

export type PublicRule = {
  /** 1 = Monday … 7 = Sunday */
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: SlotMinutes;
};

export type PublicBlockedDate = { date: string; reason: string | null };

export type PublicSchedule = {
  timezone: string;
  booking_window_weeks: number;
  rules: PublicRule[];
  /** Upcoming blocked dates inside the booking window, soonest first. */
  blocked_dates: PublicBlockedDate[];
};

export type ScheduleRule = PublicRule & { id: string; active: boolean };

export type BlockedDate = { id: string; date: string; reason: string | null };

export type Settings = { booking_window_weeks: number; timezone: string };

export type AdminSchedule = Omit<PublicSchedule, "rules" | "blocked_dates"> & {
  rules: ScheduleRule[];
  blocked_dates: BlockedDate[];
};

export type RuleInput = Omit<ScheduleRule, "id">;

export type SchedulePreviewInput =
  | ({ action: "create_rule" } & RuleInput)
  | ({ action: "update_rule"; id: string } & Partial<RuleInput>)
  | { action: "delete_rule"; id: string }
  | { action: "add_blocked_date"; date: string; reason?: string | null };

export type SchedulePreview = { affected_count: number; affected_ids: string[] };

export type AdminAppointmentsQuery = {
  from?: string;
  to?: string;
  status?: AppointmentStatus;
  page?: number;
  page_size?: number;
};

export type Paginated<T> = { page: number; page_size: number; total: number } & T;

export type ErrorCode =
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_SLOT"
  | "INVALID_TOKEN"
  | "EMAIL_TAKEN"
  | "SLOT_TAKEN"
  | "WEEKLY_LIMIT"
  | "INVALID_STATE"
  | "SCHEDULE_CONFLICT"
  | "RATE_LIMITED";

export type ErrorBody = {
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
};
