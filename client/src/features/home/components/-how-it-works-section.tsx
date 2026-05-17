import { ClipboardList, CheckCircle2, Users } from "lucide-react";
import { SectionHeader } from "./-shared-helpers.tsx";

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: 1,
    icon: Users,
    title: "Resident Reports an Issue",
    description:
      "Residents submit a maintenance request through the app with photos, location, and details.",
  },
  {
    step: 2,
    icon: ClipboardList,
    title: "Admin Assigns a Worker",
    description:
      "The building administrator reviews the request and assigns it to the appropriate maintenance worker.",
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: "Worker Fixes & Updates",
    description:
      "The maintenance worker completes the task and marks it as resolved. Everyone gets notified.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Process"
          title="How It Works"
          subtitle="A simple, transparent three-step process from issue reporting to resolution."
        />
        <div className="hiw-grid">
          {/* Connector line */}
          <div className="hiw-connector" />

          {STEPS.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="hiw-step">
              <div className="relative z-10">
                <div className="hiw-step-icon-wrap">
                  <Icon className="w-7 h-7 text-emerald-500" />
                </div>
                <span className="hiw-step-badge">{step}</span>
              </div>
              <h3 className="hiw-step-title">{title}</h3>
              <p className="hiw-step-desc">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
