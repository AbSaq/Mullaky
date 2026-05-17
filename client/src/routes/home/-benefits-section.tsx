// ─── Benefits ─────────────────────────────────────────────────────────────────

import { ClipboardList, Shield, Users, Zap } from "lucide-react";
import { SectionHeader } from "./-shared-helpers.tsx";

const BENEFITS = [
  {
    icon: Zap,
    title: "Faster Problem Resolution",
    description:
      "Cut average resolution time by 60% with streamlined workflows and instant notifications.",
  },
  {
    icon: Users,
    title: "Better Communication",
    description:
      "Bridge the gap between residents and management with transparent, real-time updates.",
  },
  {
    icon: ClipboardList,
    title: "Organized Workflows",
    description:
      "Structured task assignment and tracking eliminates confusion and missed requests.",
  },
  {
    icon: Shield,
    title: "Improved Building Safety",
    description:
      "Instant emergency alerts and proactive maintenance keeps residents safe at all times.",
  },
] as const;

export function BenefitsSection() {
  return (
    <section id="benefits" className="benefits-section">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Benefits"
          title="Why buildings choose Mullaky"
          subtitle="Purpose-built for modern residential communities of every size."
        />
        <div className="benefits-grid">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="benefit-card">
              <div className="benefit-icon">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="benefit-title">{title}</h3>
              <p className="benefit-desc">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
