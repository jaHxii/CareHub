import {
  CalendarCheck2,
  ClipboardList,
  FileText,
  HeartPulse,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: HeartPulse,
    title: "Patient records",
    description:
      "Registration and medical history stored as JSONB — flexible enough for varied record structures without rigid schemas.",
  },
  {
    icon: CalendarCheck2,
    title: "Conflict-free scheduling",
    description:
      "Overlapping appointments are rejected by a PostgreSQL exclusion constraint at the database level, not in app code.",
  },
  {
    icon: ClipboardList,
    title: "Prescriptions",
    description:
      "Prescriptions linked to appointments, with dosage and notes — scoped so doctors only manage their own patients.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description:
      "Admin, Doctor, and Patient roles with JWT auth. Patients see only their data; admins see everything.",
  },
  {
    icon: FileText,
    title: "PDF reports",
    description:
      "Server-side PDF generation for patient reports, rate-limited to 5 requests per minute per user.",
  },
  {
    icon: Zap,
    title: "Rate limiting",
    description:
      "Expensive endpoints protected with express-rate-limit — backed by Redis in production.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group rounded-2xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold tracking-tight">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}