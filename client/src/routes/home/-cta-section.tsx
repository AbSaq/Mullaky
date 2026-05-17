import { ArrowRight } from "lucide-react";

// ─── CTA ──────────────────────────────────────────────────────────────────────

export function CTASection() {
  return (
    <section className="cta-section">
      <div className="max-w-4xl mx-auto">
        <div className="cta-card">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="cta-content">
            <h2 className="cta-title">Start Managing Your Community Smarter</h2>
            <p className="cta-desc">
              Join hundreds of buildings already using Mullaky to improve
              resident satisfaction and operational efficiency.
            </p>
            <div className="cta-actions">
              <a href="/login" className="cta-btn-primary">
                Create Account <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/login" className="cta-btn-secondary">
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
