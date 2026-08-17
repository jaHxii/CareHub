import { HeartPulse } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight">CareHub</p>
              <p className="text-xs text-muted-foreground">
                Healthcare Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#demo"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Live demo
            </a>
            <a
              href="#architecture"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Architecture
            </a>
            <a
              href="#schema"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Database
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2025 Your Name · Built to learn real clinic workflows</p>
          <p className="font-mono">
            Express · PostgreSQL · JWT + RBAC · PDFKit
          </p>
        </div>
      </div>
    </footer>
  );
}