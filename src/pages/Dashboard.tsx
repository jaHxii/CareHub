import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, isAfter, isToday, parseISO } from "date-fns";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { appointmentsApi, patientsApi, prescriptionsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const statusBadge = {
  scheduled: "outline",
  completed: "default",
  cancelled: "secondary",
} as const;

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsApi.list(),
  });

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
    enabled: user?.role !== "patient",
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => prescriptionsApi.list(),
    enabled: user?.role === "patient",
  });

  if (!user) return null;

  const appointments = appointmentsQuery.data ?? [];
  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" && isAfter(parseISO(a.startsAt), new Date())
  );
  const today = appointments.filter((a) =>
    isToday(parseISO(a.startsAt))
  );
  const completed = appointments.filter((a) => a.status === "completed");

  const kpis =
    user.role === "admin"
      ? [
          { icon: Users, label: "Total patients", value: String(patientsQuery.data?.length ?? 0), tone: "text-primary" },
          { icon: CalendarDays, label: "Total appointments", value: String(appointments.length), tone: "text-sky-500" },
          { icon: CalendarPlus, label: "Upcoming", value: String(upcoming.length), tone: "text-amber-500" },
          { icon: CheckCircle2, label: "Completed", value: String(completed.length), tone: "text-emerald-500" },
        ]
      : user.role === "doctor"
        ? [
            { icon: CalendarDays, label: "Today's appointments", value: String(today.length), tone: "text-primary" },
            { icon: CalendarPlus, label: "Upcoming", value: String(upcoming.length), tone: "text-sky-500" },
            { icon: CheckCircle2, label: "Completed", value: String(completed.length), tone: "text-emerald-500" },
            { icon: Users, label: "Patients", value: String(patientsQuery.data?.length ?? 0), tone: "text-violet-500" },
          ]
        : [
            { icon: CalendarDays, label: "My appointments", value: String(appointments.length), tone: "text-primary" },
            { icon: CalendarPlus, label: "Upcoming", value: String(upcoming.length), tone: "text-sky-500" },
            { icon: ClipboardList, label: "Prescriptions", value: String(prescriptionsQuery.data?.length ?? 0), tone: "text-violet-500" },
            { icon: CheckCircle2, label: "Completed visits", value: String(completed.length), tone: "text-emerald-500" },
          ];

  const greeting =
    user.role === "admin"
      ? "System overview"
      : user.role === "doctor"
        ? "Your schedule"
        : "Your care at a glance";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">{greeting}</p>
        </div>
        <Button asChild>
          <Link to="/appointments">
            <CalendarPlus className="h-4 w-4" />
            {user.role === "patient" ? "View appointments" : "New appointment"}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming appointments</CardTitle>
            <CardDescription>
              {upcoming.length > 0
                ? `${upcoming.length} scheduled ${upcoming.length === 1 ? "visit" : "visits"} ahead`
                : "No upcoming appointments"}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/appointments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing scheduled.{" "}
              <Link to="/appointments" className="font-medium text-primary hover:underline">
                {user.role === "patient" ? "Your appointments will appear here" : "Create an appointment"}
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.slice(0, 5).map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patientName}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{format(parseISO(appointment.startsAt), "MMM d, h:mm a")}</TableCell>
                    <TableCell>{format(parseISO(appointment.endsAt), "h:mm a")}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[appointment.status]}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}