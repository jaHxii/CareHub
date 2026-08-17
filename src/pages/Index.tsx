import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { FeatureGrid } from "@/components/portfolio/FeatureGrid";
import { StackSection } from "@/components/portfolio/StackSection";
import { ChallengesSection } from "@/components/portfolio/ChallengesSection";
import { Footer } from "@/components/portfolio/Footer";
import RoleMock from "@/components/portfolio/RoleMock";
import SchemaPreview from "@/components/portfolio/SchemaPreview";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Hero />

        {/* Features */}
        <section id="features" className="scroll-mt-24 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Features"
              title="Everything a real clinic needs"
              description="Modeled on actual workflows — appointments, records, prescriptions, and reports — not a toy CRUD app."
            />
            <FeatureGrid />
          </div>
        </section>

        {/* Architecture */}
        <section
          id="architecture"
          className="scroll-mt-24 border-y border-border/70 bg-muted/30 py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Architecture"
              title="Frontend to database, end to end"
              description="A clean client → API → PostgreSQL flow, with auth and role checks between every hop."
            />
            <StackSection />
          </div>
        </section>

        {/* Database schema */}
        <section id="schema" className="scroll-mt-24 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Database"
              title="Normalized where it matters"
              description="Four core tables. Strict schemas where relationships are key, JSONB where records vary."
            />
            <SchemaPreview />
            <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
              A <span className="font-mono text-xs">tstzrange</span> exclusion
              constraint on <span className="font-mono text-xs">appointments</span>{" "}
              guarantees a doctor can never be double-booked — enforced in SQL,
              not app code.
            </p>
          </div>
        </section>

        {/* Live demo */}
        <section
          id="demo"
          className="scroll-mt-24 border-y border-border/70 bg-muted/30 py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Live demo"
              title="Role-based views, interactive"
              description="Switch between Admin, Doctor, and Patient to see how the dashboard adapts. No backend needed — this demonstrates the RBAC logic on the client."
            />
            <div className="mx-auto max-w-4xl">
              <RoleMock />
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section id="challenges" className="scroll-mt-24 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Challenges & decisions"
              title="The hard parts, and how I solved them"
              description="Three design decisions that turned out to matter more than expected."
            />
            <ChallengesSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;