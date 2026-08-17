import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, ClipboardList, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  appointmentsApi,
  patientsApi,
  prescriptionsApi,
  type Appointment,
} from "@/lib/api";

const statusBadge = {
  scheduled: "outline",
  completed: "default",
  cancelled: "secondary",
} as const;

export default function PatientDetail() {
  const { id = "" } = useParams();

  const patientQuery = useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientsApi.get(id),
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", { patientId: id }],
    queryFn: () => appointmentsApi.list({ patientId: id }),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => prescriptionsApi.list(),
  });

  const patient = patientQuery.data;
  const appointments = appointmentsQuery.data ?? [];
  const prescriptions = (prescriptionsQuery.data ?? []).filter(
    (p) => p.patientId === id
  );

  const prescriptionsByAppointment = new Map<string, typeof prescriptions>();
  for (const p of prescriptions) {
    const list = prescriptionsByAppointment.get(p.appointmentId) ?? [];
    list.push(p);
    prescriptionsByAppointment.set(p.appointmentId, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/patients">
            <ArrowLeft className="h-4 w-4" />
            Back to patients
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {patient?.fullName ?? "Patient"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {patient?.email ?? "Loading profile…"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {patientQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : patient ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Full name</p>
                  <p className="font-medium">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of birth</p>
                  <p className="font-medium">
                    {patient.dob
                      ? format(parseISO(patient.dob), "MMMM d, yyyy")
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {format(parseISO(patient.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Patient not found.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Appointments
              </CardTitle>
              <CardDescription>
                {appointments.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : appointments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No appointments on record.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Ends</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: Appointment) => {
                      const scripts = prescriptionsByAppointment.get(appointment.id) ?? [];
                      return (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.doctorName}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(appointment.startsAt), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(appointment.endsAt), "h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge[appointment.status]}>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to={`/prescriptions?appointmentId=${appointment.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {scripts.length} prescription{scripts.length === 1 ? "" : "s"}
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Prescriptions
              </CardTitle>
              <CardDescription>{prescriptions.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptionsQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : prescriptions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No prescriptions on record.
                </p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{prescription.medication}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(prescription.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="mt-1 text-sm">{prescription.dosage}</p>
                      {prescription.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {prescription.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}