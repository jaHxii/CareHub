import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="bg-grid mask-fade-edges pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <HeartPulse className="h-6 w-6" />
        </span>
        <p className="font-mono text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          We couldn&apos;t find that page. It may have moved, or the link is
          broken.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;