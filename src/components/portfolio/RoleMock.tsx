import { useState } from "react";
import {
  Bell,
  CalendarCheck2,
  ClipboardPlus,
  FileBarChart,
  FlaskConical,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "admin" | "doctor" | "patient";

interface Kpi {
  icon: typeof Users;
  label: string;
  value: string;
  tone: string;
  alert?: boolean;
}

interface DashboardData {
  greeting: string;
  kpis: Kpi[];
  tableTitle: string;
  rows: { name: string; detail: string; badge: string }[];
  note: string;
}

const dashboards: Record<Role, DashboardData> = {
  admin: {
    greeting: "System Administrator",
    kpis: [
      { icon: Users, label: "Total patients", value: "1,247", tone: "text-primary" },
      { icon: ShieldCheck, label: "Active staff", value: "84", tone: "text-sky-500" },
      { icon: Bell, label: "Pending approvals", value: "12", tone: "text-amber-500", alert: true },
      { icon: FileBarChart, label: "Reports this week", value: "38", tone: "text-violet-500" },
    ],
    tableTitle: "Recent approvals",
    rows: [
      { name: "Dr. A. Reyes", detail: "Role change: doctor", badge: "pending" },
      { name: "Nurse M. Okafor", detail: "Role change: staff", badge: "approved" },
      { name: "Dr. S. Chen", detail: "New account", badge: "approved" },
    ],
    note: "You have 3 staff role change requests pending review.",
  },
  doctor: {
    greeting: "Dr. Sarah Chen",
    kpis: [
      { icon: CalendarCheck2, label: "Appointments today", value: "7", tone: "text-primary" },
      { icon: Users, label: "Next patient", value: "Room 204", tone: "text-sky-500" },
      { icon: ClipboardPlus, label: "Pending scripts", value: "3", tone: "text-amber-500" },
      { icon: FlaskConical, label: "Unread lab results", value: "2", tone: "text-rose-500", alert: true },
    ],
    tableTitle: "Today's schedule",
    rows: [
      { name: "10:30 AM", detail: "James Miller — Room 204", badge: "checked in" },
      { name: "11:15 AM", detail: "Emma Wilson — Room 201", badge: "waiting" },
      { name: "2:00 PM", detail: "Noah Patel — Video", badge: "upcoming" },
    ],
    note: "Reminder: submit your timesheet by Friday.",
  },
  patient: {
    greeting: "James Miller",
    kpis: [
      { icon: CalendarCheck2, label: "Upcoming visit", value: "Mar 15", tone: "text-primary" },
      { icon: Users, label: "Your doctor", value: "Dr. Chen", tone: "text-sky-500" },
      { icon: ClipboardPlus, label: "Pending scripts", value: "1", tone: "text-amber-500" },
      { icon: FlaskConical, label: "Last visit", value: "Feb 28", tone: "text-violet-500" },
    ],
    tableTitle: "Recent visits",
    rows: [
      { name: "Feb 28, 2025", detail: "Dr. Sarah Chen — checkup", badge: "completed" },
      { name: "Jan 12, 2025", detail: "Dr. Sarah Chen — follow-up", badge: "completed" },
      { name: "Mar 15, 2:00 PM", detail: "Dr. Sarah Chen — booked", badge: "upcoming" },
    ],
    note: "Your lab results from Feb 28 are ready to view.",
  },
};

const roleMeta: Record<Role, { icon: typeof Users; name: string }> = {
  admin: { icon: ShieldCheck, name: "Admin" },
  doctor: { icon: CalendarCheck2, name: "Doctor" },
  patient: { icon: Users, name: "Patient" },
};

const badgeTone: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "checked in": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  waiting: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

const RoleMock = () => {
  const [role, setRole] = useState<Role>("admin");
  const data = dashboards[role];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      {/* Role switcher */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
        <div className="flex rounded-xl border border-border/70 bg-card p-1">
          {(Object.keys(dashboards) as Role[]).map((r) => {
            const meta = roleMeta[r];
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  role === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <meta.icon className="h-4 w-4" />
                {meta.name}
              </button>
            );
          })}
        </div>
        <p className="ml-auto hidden text-xs text-muted-foreground sm:block">
          Switch role → the dashboard adapts. Backend scopes it for real.
        </p>
      </div>

      {/* Dashboard body */}
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{data.greeting}</p>
          <span className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            Today
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {data.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border/70 bg-card p-3.5"
            >
              <div className="flex items-center justify-between">
                <kpi.icon className={`h-4 w-4 ${kpi.tone}`} />
                {kpi.alert && (
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-destructive" />
                )}
              </div>
              <p className="mt-2.5 text-xl font-bold tracking-tight">
                {kpi.value}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-3 rounded-xl border border-border/70 bg-card">
          <p className="border-b border-border/70 px-4 py-2.5 text-xs font-semibold">
            {data.tableTitle}
          </p>
          <div className="divide-y divide-border/50">
            {data.rows.map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.detail}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                    badgeTone[row.badge]
                  )}
                >
                  {row.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs text-primary">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {data.note}
        </div>
      </div>
    </div>
  );
};

export default RoleMock;