import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  CalendarCheck2,
  ClipboardPlus,
  FileBarChart,
  ArrowUpRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarDays, label: "Appointments" },
  { icon: Users, label: "Patients" },
  { icon: ClipboardList, label: "Prescriptions" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const kpis = [
  {
    icon: Users,
    label: "Total patients",
    value: "1,247",
    delta: "+12 this week",
    tone: "text-primary",
  },
  {
    icon: CalendarCheck2,
    label: "Appointments today",
    value: "7",
    delta: "2 completed",
    tone: "text-sky-500",
  },
  {
    icon: ClipboardPlus,
    label: "Pending scripts",
    value: "3",
    delta: "needs review",
    tone: "text-amber-500",
  },
  {
    icon: FileBarChart,
    label: "Reports this week",
    value: "38",
    delta: "+18% vs last",
    tone: "text-violet-500",
  },
];

const bars = [42, 58, 46, 72, 64, 88, 54, 96, 70, 82, 60, 76];

const activity = [
  {
    name: "Dr. Sarah Chen",
    action: "completed an appointment",
    time: "2m ago",
    color: "bg-primary",
  },
  {
    name: "James Miller",
    action: "prescription issued",
    time: "18m ago",
    color: "bg-amber-500",
  },
  {
    name: "Admin",
    action: "approved a role change",
    time: "1h ago",
    color: "bg-sky-500",
  },
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-border/70 bg-muted/50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          carehub.app/dashboard
        </div>
        <span className="hidden items-center gap-1.5 text-xs font-medium text-primary sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
          Live
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border/70 bg-muted/30 p-3 md:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-border/70 bg-card p-3">
            <p className="text-xs font-semibold text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground">
              admin@carehub.demo
            </p>
          </div>
        </aside>

        {/* Main panel */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Good morning, Admin</p>
              <p className="text-xs text-muted-foreground">
                Here&apos;s what&apos;s happening today.
              </p>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:flex">
              <CalendarDays className="h-3.5 w-3.5" />
              Mar 15
            </span>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-border/70 bg-card p-3"
              >
                <kpi.icon className={`h-4 w-4 ${kpi.tone}`} />
                <p className="mt-2 text-lg font-bold tracking-tight">
                  {kpi.value}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 flex items-center gap-0.5 text-[11px] font-medium text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Chart + activity */}
          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="rounded-xl border border-border/70 bg-card p-4 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold">Weekly appointments</p>
                <span className="text-[11px] font-medium text-primary">
                  +18%
                </span>
              </div>
              <div className="flex h-24 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      i === 7
                        ? "bg-gradient-to-t from-primary to-sky-400"
                        : "bg-primary/25"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 lg:col-span-2">
              <p className="mb-3 text-xs font-semibold">Recent activity</p>
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {a.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          {a.action}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}