import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi, patientsApi, type Patient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const createPatientSchema = z.object({
  userId: z.string().min(1, "Select a user"),
  dob: z.string().min(1, "Date of birth is required"),
});

const editPatientSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  dob: z.string().min(1, "Date of birth is required"),
  medicalHistory: z.string().optional(),
});

function PatientFormDialog({
  open,
  onOpenChange,
  mode,
  patient,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  patient?: Patient;
  users?: { id: string; fullName: string; email: string }[];
}) {
  const queryClient = useQueryClient();
  const isCreate = mode === "create";

  const form = useForm<
    z.infer<typeof createPatientSchema> | z.infer<typeof editPatientSchema>
  >({
    resolver: zodResolver(isCreate ? createPatientSchema : editPatientSchema),
    defaultValues: isCreate
      ? { userId: "", dob: "" }
      : {
          fullName: patient?.fullName ?? "",
          dob: patient?.dob ? patient.dob.slice(0, 10) : "",
          medicalHistory: patient?.medicalHistory
            ? JSON.stringify(patient.medicalHistory, null, 2)
            : "",
        },
  });

  const mutation = useMutation({
    mutationFn: async (
      values: z.infer<typeof createPatientSchema> | z.infer<typeof editPatientSchema>
    ) => {
      if (isCreate) {
        const v = values as z.infer<typeof createPatientSchema>;
        return patientsApi.create({
          userId: v.userId,
          dob: v.dob,
        });
      }
      const v = values as z.infer<typeof editPatientSchema>;
      let medicalHistory: Record<string, unknown> | undefined;
      if (v.medicalHistory?.trim()) {
        try {
          medicalHistory = JSON.parse(v.medicalHistory);
        } catch {
          throw new Error("Medical history must be valid JSON");
        }
      }
      return patientsApi.update(patient!.id, {
        fullName: v.fullName,
        dob: v.dob,
        medicalHistory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success(isCreate ? "Patient record created" : "Patient updated");
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "New patient record" : "Edit patient"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Attach a DOB to an existing patient user."
              : "Update the patient's details and medical history."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            {isCreate ? (
              <>
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(users ?? []).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName} · {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical history (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder='{"allergies": ["penicillin"], "conditions": []}'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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

export default function Patients() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });

  const patientUsersQuery = useQuery({
    queryKey: ["users", "patient"],
    queryFn: () => authApi.listUsers("patient"),
    enabled: user?.role === "admin",
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "patient"
              ? "Patient records are managed by staff."
              : `${patientsQuery.data?.length ?? 0} registered patient${(patientsQuery.data?.length ?? 0) === 1 ? "" : "s"}`}
          </p>
        </div>
        {user.role === "admin" && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New patient
              </Button>
            </DialogTrigger>
            <PatientFormDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              mode="create"
              users={patientUsersQuery.data}
            />
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {patientsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : patientsQuery.data && patientsQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date of birth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsQuery.data.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {patient.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>
                      {patient.dob
                        ? format(parseISO(patient.dob), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(patient)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No patients found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <PatientFormDialog
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          mode="edit"
          patient={editing}
        />
      )}
    </div>
  );
}