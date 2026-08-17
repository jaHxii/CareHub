import { ArrowRight, Github, HeartPulse } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

const stats = [
  { value: "4", label: "Core entities" },
  { value: "12+", label: "REST endpoints" },
  { value: "3", label: "User roles" },
  { value: "99.7%", label: "Uptime target" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-fade-edges absolute inset-0" />
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute left-[-8rem] top-72 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            Fullstack · Express · PostgreSQL · JWT + RBAC
          </div>

          <h1
            className="animate-fade-up mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Healthcare management,{" "}
            <span className="text-gradient">done properly.</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            A fullstack system for appointments, patient records, and
            prescriptions — with conflict-free scheduling enforced in the
            database and role-based access across three user types.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#demo"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Github className="h-4 w-4" />
              View architecture
            </a>
          </div>
        </div>

        {/* App preview */}
        <div
          className="animate-fade-up relative mx-auto mt-16 max-w-4xl"
          style={{ animationDelay: "320ms" }}
        >
          <div className="absolute -inset-x-6 -top-8 -bottom-6 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-2xl" />
          <div className="animate-float">
            <DashboardPreview />
          </div>

          {/* Floating chips */}
          <div className="animate-float absolute -left-6 top-16 hidden rounded-xl border border-border/70 bg-card/90 px-4 py-3 shadow-card backdrop-blur lg:block" style={{ animationDelay: "1.2s" }}>
            <p className="text-[11px] font-medium text-muted-foreground">
              Overlap conflicts
            </p>
            <p className="text-sm font-bold text-primary">0 rejected</p>
          </div>
          <div className="animate-float absolute -right-6 bottom-16 hidden rounded-xl border border-border/70 bg-card/90 px-4 py-3 shadow-card backdrop-blur lg:block" style={{ animationDelay: "2s" }}>
            <p className="text-[11px] font-medium text-muted-foreground">
              Reports
            </p>
            <p className="text-sm font-bold text-primary">PDF · 5 req/min</p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="animate-fade-up mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/60 sm:grid-cols-4"
          style={{ animationDelay: "400ms" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card/80 px-6 py-5 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}