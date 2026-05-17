import { Wrench, Bell, ClipboardList, Activity } from "lucide-react";
import { SectionHeader } from "./-shared-helpers";

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Wrench,
    title: "Maintenance Requests",
    description:
      "Residents can easily report issues like elevator failures, water leaks, or electrical problems directly from their phones.",
    iconClass: "bg-blue-50 text-blue-500",
  },
  {
    icon: Bell,
    title: "Emergency Alerts",
    description:
      "Admins can instantly broadcast emergency notifications to all residents with a single click.",
    iconClass: "bg-red-50 text-red-500",
  },
  {
    icon: ClipboardList,
    title: "Task Assignment",
    description:
      "Maintenance workers receive clear task assignments and can update progress in real-time from any device.",
    iconClass: "bg-emerald-50 text-emerald-500",
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    description:
      "Track every issue from submission to resolution with live status updates and transparent timelines.",
    iconClass: "bg-purple-50 text-purple-500",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="features-section">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Features"
          title="Everything your building needs"
          subtitle="A complete toolkit for modern homeowner association management."
        />
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, description, iconClass }) => (
            <div key={title} className="feature-card">
              <div className={`feature-icon ${iconClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
