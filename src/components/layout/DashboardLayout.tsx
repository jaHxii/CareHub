import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/portfolio/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/api";

interface NavItem {
  label: string;
  to: string;
  icon: typeof Users;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "doctor", "patient"],
  },
  {
    label: "Appointments",
    to: "/appointments",
    icon: CalendarDays,
    roles: ["admin", "doctor", "patient"],
  },
  {
    label: "Prescriptions",
    to: "/prescriptions",
    icon: ClipboardList,
    roles: ["admin", "doctor", "patient"],
  },
  {
    label: "Patients",
    to: "/patients",
    icon: Users,
    roles: ["admin", "doctor"],
  },
  {
    label: "Staff",
    to: "/staff",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: FileText,
    roles: ["admin", "doctor"],
  },
];

const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const visible = navItems.filter((item) => item.roles.includes(user.role));

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <Link to="/" className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">CareHub</span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user.fullName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabel[user.role]}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <nav className="flex items-center gap-1 lg:hidden">
            <Link
              to="/"
              className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <HeartPulse className="h-4 w-4" />
            </Link>
            {visible.slice(0, 4).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-2.5 py-1.5 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel[user.role]}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="lg:hidden">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}