import type { Send } from "./client";
import type {
  AdminAppointment,
  AdminAppointmentsQuery,
  AdminSchedule,
  Appointment,
  BlockedDate,
  Paginated,
  PublicSchedule,
  RuleInput,
  SchedulePreview,
  SchedulePreviewInput,
  ScheduleRule,
  Settings,
  SlotsResponse,
  User,
} from "./types";

export type RegisterInput = { full_name: string; email: string; phone: string; password: string };

/** One small function per endpoint in ISAAC.md section 3. Nothing else calls fetch. */
export function createApi(send: Send) {
  return {
    auth: {
      register: (input: RegisterInput) =>
        send<{ user: User }>("/auth/register", { method: "POST", body: input }),
      login: (input: { email: string; password: string }) =>
        send<{ user: User }>("/auth/login", { method: "POST", body: input }),
      logout: () => send<undefined>("/auth/logout", { method: "POST" }),
      me: () => send<{ user: User }>("/auth/me"),
      forgotPassword: (email: string) =>
        send<undefined>("/auth/forgot-password", { method: "POST", body: { email } }),
      resetPassword: (input: { token: string; password: string }) =>
        send<undefined>("/auth/reset-password", { method: "POST", body: input }),
    },

    schedule: () => send<PublicSchedule>("/schedule"),

    slots: (range: { from: string; to: string }, signal?: AbortSignal) =>
      send<SlotsResponse>("/slots", { query: range, signal }),

    appointments: {
      create: (input: { slot_start: string; prayer_point: string }) =>
        send<{ appointment: Appointment }>("/appointments", { method: "POST", body: input }),
      mine: () => send<{ appointments: Appointment[] }>("/appointments/mine"),
      cancel: (id: string) =>
        send<{ appointment: Appointment }>(`/appointments/${encodeURIComponent(id)}/cancel`, {
          method: "POST",
        }),
    },

    admin: {
      appointments: {
        list: (query: AdminAppointmentsQuery = {}) =>
          send<Paginated<{ appointments: AdminAppointment[] }>>("/admin/appointments", { query }),
        get: (id: string) =>
          send<{ appointment: AdminAppointment }>(`/admin/appointments/${encodeURIComponent(id)}`),
        setStatus: (id: string, status: "completed" | "cancelled") =>
          send<{ appointment: AdminAppointment }>(`/admin/appointments/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: { status },
          }),
      },
      schedule: {
        get: () => send<AdminSchedule>("/admin/schedule"),
        createRule: (input: RuleInput) =>
          send<{ rule: ScheduleRule }>("/admin/schedule/rules", { method: "POST", body: input }),
        updateRule: (id: string, input: Partial<RuleInput>) =>
          send<{ rule: ScheduleRule }>(`/admin/schedule/rules/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: input,
          }),
        deleteRule: (id: string) =>
          send<undefined>(`/admin/schedule/rules/${encodeURIComponent(id)}`, { method: "DELETE" }),
        addBlockedDate: (input: { date: string; reason?: string | null }) =>
          send<{ blocked_date: BlockedDate }>("/admin/schedule/blocked-dates", {
            method: "POST",
            body: input,
          }),
        deleteBlockedDate: (id: string) =>
          send<undefined>(`/admin/schedule/blocked-dates/${encodeURIComponent(id)}`, {
            method: "DELETE",
          }),
        updateSettings: (input: { booking_window_weeks: number }) =>
          send<{ settings: Settings }>("/admin/schedule/settings", {
            method: "PATCH",
            body: input,
          }),
        preview: (input: SchedulePreviewInput) =>
          send<SchedulePreview>("/admin/schedule/preview", { method: "POST", body: input }),
      },
    },

    health: () => send<{ ok: boolean }>("/health"),
  };
}

export type Api = ReturnType<typeof createApi>;
