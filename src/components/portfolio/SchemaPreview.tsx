import { KeyRound, Link2, Star } from "lucide-react";

interface Column {
  name: string;
  type: string;
  note: string;
}

interface Table {
  name: string;
  columns: Column[];
}

const tables: Table[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "UUID", note: "PK" },
      { name: "email", type: "VARCHAR(255)", note: "UNIQUE" },
      { name: "password_hash", type: "TEXT", note: "" },
      { name: "role", type: "ENUM", note: "admin·doctor·patient" },
      { name: "created_at", type: "TIMESTAMPTZ", note: "default now()" },
    ],
  },
  {
    name: "patients",
    columns: [
      { name: "id", type: "UUID", note: "PK" },
      { name: "user_id", type: "UUID", note: "FK → users" },
      { name: "full_name", type: "VARCHAR(255)", note: "" },
      { name: "dob", type: "DATE", note: "" },
      { name: "medical_history", type: "JSONB", note: "flexible" },
    ],
  },
  {
    name: "appointments",
    columns: [
      { name: "id", type: "UUID", note: "PK" },
      { name: "patient_id", type: "UUID", note: "FK → patients" },
      { name: "doctor_id", type: "UUID", note: "FK → users" },
      { name: "starts_at", type: "TIMESTAMPTZ", note: "" },
      { name: "ends_at", type: "TIMESTAMPTZ", note: "" },
      { name: "status", type: "VARCHAR(20)", note: "scheduled·completed·cancelled" },
    ],
  },
  {
    name: "prescriptions",
    columns: [
      { name: "id", type: "UUID", note: "PK" },
      { name: "appointment_id", type: "UUID", note: "FK → appointments" },
      { name: "medication", type: "TEXT", note: "" },
      { name: "dosage", type: "VARCHAR(100)", note: "" },
      { name: "notes", type: "TEXT", note: "nullable" },
    ],
  },
];

function noteIcon(note: string) {
  if (note.startsWith("PK")) return KeyRound;
  if (note.startsWith("FK")) return Link2;
  if (note.startsWith("UNIQUE")) return Star;
  return null;
}

function noteTone(note: string) {
  if (note.startsWith("PK")) return "text-primary";
  if (note.startsWith("FK")) return "text-sky-500";
  if (note.startsWith("UNIQUE")) return "text-amber-500";
  return "text-muted-foreground";
}

const SchemaPreview = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {tables.map((table) => (
      <div
        key={table.name}
        className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
          <span className="font-mono text-sm font-semibold text-foreground">
            {table.name}
          </span>
          <span className="rounded-full border border-border/70 bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {table.columns.length} columns
          </span>
        </div>
        <div className="divide-y divide-border/50">
          {table.columns.map((col) => {
            const Icon = noteIcon(col.note);
            return (
              <div
                key={col.name}
                className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40"
              >
                <span className="w-32 shrink-0 truncate font-mono text-[13px] text-foreground">
                  {col.name}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {col.type}
                </span>
                {col.note && (
                  <span
                    className={`ml-auto flex items-center gap-1 text-[11px] font-medium ${noteTone(col.note)}`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {col.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

export default SchemaPreview;