import {
  Database,
  FileText,
  Lock,
  MonitorSmartphone,
  Server,
} from "lucide-react";

const layers = [
  { icon: MonitorSmartphone, name: "Frontend", value: "React + Tailwind" },
  { icon: Server, name: "Backend", value: "Node / Express" },
  { icon: Database, name: "Database", value: "PostgreSQL" },
  { icon: Lock, name: "Auth", value: "JWT + RBAC" },
  { icon: FileText, name: "Reports", value: "PDFKit + rate limit" },
];

const endpoints = [
  { method: "POST", path: "/api/auth/login", desc: "obtain a JWT" },
  { method: "POST", path: "/api/appointments", desc: "409 on overlap" },
  { method: "GET", path: "/api/patients", desc: "RBAC-scoped" },
  { method: "POST", path: "/api/prescriptions", desc: "linked to visit" },
  { method: "GET", path: "/api/reports/patients", desc: "PDF · 5 req/min" },
];

const methodTone: Record<string, string> = {
  GET: "text-sky-500",
  POST: "text-emerald-500",
  PATCH: "text-amber-500",
};

export function StackSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Stack layers */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
        <h3 className="text-base font-semibold tracking-tight">
          Built on a modern stack
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything wired end-to-end, from the UI to the database.
        </p>
        <div className="mt-5 space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.name}
              className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border/70 hover:bg-muted/40"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <layer.icon className="h-4 w-4 text-primary" />
                {layer.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {layer.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* API map */}
      <div className="flex flex-col rounded-2xl border border-border/80 bg-code-bg p-6 text-code-foreground shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">
            API surface
          </h3>
          <span className="rounded-md border border-border/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            12+ endpoints
          </span>
        </div>
        <div className="mt-5 space-y-2.5">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="flex items-center gap-3 rounded-lg bg-code-bg/60 px-3 py-2 font-mono text-[13px]"
            >
              <span
                className={`w-12 shrink-0 font-semibold ${methodTone[ep.method] ?? "text-code-foreground"}`}
              >
                {ep.method}
              </span>
              <span className="truncate">{ep.path}</span>
              <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:block">
                {ep.desc}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Role-scoped queries mean a patient&apos;s token can never read another
          patient&apos;s record — enforced in both middleware and SQL.
        </p>
      </div>
    </div>
  );
}