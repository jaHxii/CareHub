import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ClipboardList, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  appointmentsApi,
  prescriptionsApi,
  type Prescription,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const prescriptionSchema = z.object({
  appointmentId: z.string().min(1, "Select an appointment"),
  medication: z.string().min(1, "Medication is required").max(500),
  dosage: z.string().min(1, "Dosage is required").max(100),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof prescriptionSchema>;

function PrescriptionDialog({
  open,
  onOpenChange,
  prescription,
  initialAppointmentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription?: Prescription;
  initialAppointmentId?: string;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!prescription;

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsApi.list(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: isEdit
      ? {
          appointmentId: prescription.appointmentId,
          medication: prescription.medication,
          dosage: prescription.dosage,
          notes: prescription.notes ?? "",
        }
      : {
          appointmentId: initialAppointmentId ?? "",
          medication: "",
          dosage: "",
          notes: "",
        },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? prescriptionsApi.update(prescription.id, {
            medication: values.medication,
            dosage: values.dosage,
            notes: values.notes || null,
          })
        : prescriptionsApi.create({
            appointmentId: values.appointmentId,
            medication: values.medication,
            dosage: values.dosage,
            notes: values.notes || null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success(isEdit ? "Prescription updated" : "Prescription created");
      onOpenChange(false);
      if (!isEdit) form.reset();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit prescription" : "New prescription"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the medication details."
              : "Prescriptions are attached to a specific appointment."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            {!isEdit && (
              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an appointment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(appointmentsQuery.data ?? []).map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {appointment.patientName} ·{" "}
                            {format(parseISO(appointment.startsAt), "MMM d, h:mm a")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication</FormLabel>
                  <FormControl>
                    <Input placeholder="Amoxicillin 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1 capsule, 3x daily for 7 days"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Take with food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Prescriptions() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);

  const initialAppointmentId = searchParams.get("appointmentId") ?? undefined;

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => prescriptionsApi.list(),
  });

  const canManage = user?.role === "admin" || user?.role === "doctor";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-sm text-muted-foreground">
            {prescriptionsQuery.data?.length ?? 0} total
          </p>
        </div>
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New prescription
              </Button>
            </DialogTrigger>
            <PrescriptionDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              initialAppointmentId={initialAppointmentId}
            />
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Medication history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptionsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : prescriptionsQuery.data && prescriptionsQuery.data.length > 0 ? (
            <div className="space-y-3">
              {prescriptionsQuery.data.map((prescription) => (
                <div
                  key={prescription.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{prescription.medication}</p>
                      <p className="mt-0.5 text-sm">{prescription.dosage}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{format(parseISO(prescription.createdAt), "MMM d, yyyy")}</p>
                      {user?.role !== "patient" && prescription.patientId && (
                        <p className="mt-1">
                          Patient{" "}
                          <span className="text-foreground">
                            {prescription.patientId.slice(0, 8)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  {prescription.notes && (
                    <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      {prescription.notes}
                    </p>
                  )}
                  {canManage && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(prescription)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No prescriptions found.
            </p>
          )}
        </CardContent>
      </Card>

      {editing && (
        <PrescriptionDialog
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          prescription={editing}
        />
      )}
    </div>
  );
}