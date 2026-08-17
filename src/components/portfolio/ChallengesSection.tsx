import { Database, FileClock, Repeat } from "lucide-react";

const challenges = [
  {
    icon: Repeat,
    title: "Overlapping appointments",
    problem:
      "Time-range conflicts were harder than expected — checking every pair in application code was slow and error-prone.",
    decision: (
      <>
        Used a PostgreSQL <b className="font-semibold">exclusion constraint</b>{" "}
        with <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-code-foreground">tstzrange</code> —
        the database rejects overlaps before they ever reach the app.
      </>
    ),
  },
  {
    icon: Database,
    title: "Medical history as JSONB",
    problem:
      "A separate table per condition type would mean rigid schemas and painful migrations for varied record structures.",
    decision: (
      <>
        Chose <b className="font-semibold">JSONB</b> for flexibility. Trade-off:
        harder to query across patients, but fine for per-patient views.
      </>
    ),
  },
  {
    icon: FileClock,
    title: "Rate-limiting PDF generation",
    problem:
      "Server-side rendering of reports is expensive — a single user could hammer the endpoint.",
    decision: (
      <>
        Added <b className="font-semibold">express-rate-limit</b> on{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-code-foreground">/api/reports</code> —
        5 requests per minute per user, Redis-backed in production.
      </>
    ),
  },
];

export function ChallengesSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {challenges.map((challenge) => (
        <div
          key={challenge.title}
          className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <challenge.icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold tracking-tight">
            {challenge.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {challenge.problem}
          </p>
          <div className="mt-4 border-t border-border/70 pt-4 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Decision
            </p>
            {challenge.decision}
          </div>
        </div>
      ))}
    </div>
  );
}