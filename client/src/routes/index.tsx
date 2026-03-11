import { createFileRoute } from "@tanstack/react-router";
import {
  Wrench,
  Bell,
  ClipboardList,
  Activity,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import "./index.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="navbar-logo-text">Mulaky</span>
        </div>

        {/* Desktop nav */}
        <nav className="navbar-nav">
          {["#features", "#how-it-works", "#benefits"].map((href) => (
            <a key={href} href={href} className="navbar-nav-link">
              {href.replace("#", "").replace("-", " ")}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="navbar-actions">
          <a href="/login" className="navbar-login-link">Login</a>
          <a href="/login" className="navbar-cta">Get Started</a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="navbar-hamburger"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <a href="#features" className="navbar-mobile-link">Features</a>
          <a href="#how-it-works" className="navbar-mobile-link">How It Works</a>
          <a href="#benefits" className="navbar-mobile-link">Benefits</a>
          <a href="/login" className="navbar-mobile-link">Login</a>
          <a href="/login" className="navbar-mobile-cta">Get Started</a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="hero-section">
      {/* Ambient blobs */}
      <div className="absolute top-20 right-[-100px] w-[500px] h-[500px] bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-80px] w-[400px] h-[400px] bg-green-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="hero-inner">
        {/* Copy */}
        <div className="hero-copy">
          <div className="hero-badge">
            <Zap className="w-3.5 h-3.5" />
            <span>HOA Management, Simplified</span>
          </div>

          <h1 className="hero-title">
            Smart Community
            <span className="block text-emerald-500">Management for</span>
            Modern Buildings
          </h1>

          <p className="hero-subtitle">
            Mulaky helps residents, administrators, and maintenance teams
            manage building issues, emergency alerts, and community
            communication — all in one seamless platform.
          </p>

          <div className="hero-cta-group">
            <a href="/login" className="hero-cta-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/login" className="hero-cta-secondary">Login</a>
          </div>

          <div className="hero-stats">
            {["500+ Buildings", "50K+ Residents", "99.9% Uptime"].map((stat) => (
              <div key={stat} className="hero-stat">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{stat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard card */}
        <div className="hidden lg:flex justify-center">
          <div className="relative w-full max-w-lg">
            {/* Main panel */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <span className="text-sm font-semibold text-gray-800">Building Dashboard</span>
                <span className="dashboard-live-badge">● Live</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Open Issues", value: "12", color: "text-orange-500" },
                  { label: "In Progress", value: "8", color: "text-blue-500" },
                  { label: "Resolved", value: "47", color: "text-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="dashboard-stat-cell">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                {[
                  { title: "Elevator Malfunction – Floor 3", status: "In Progress", color: "bg-blue-100 text-blue-700" },
                  { title: "Water Leak – Apartment 14B", status: "Assigned", color: "bg-orange-100 text-orange-700" },
                  { title: "Lobby Light Repair", status: "Resolved", color: "bg-emerald-100 text-emerald-700" },
                ].map((item) => (
                  <div key={item.title} className="dashboard-row">
                    <span className="text-xs font-medium text-gray-700">{item.title}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating alert badge */}
            <div className="floating-badge -top-6 -right-6 w-56">
              <div className="bg-red-100 p-2 rounded-xl shrink-0">
                <Bell className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Emergency Alert</p>
                <p className="text-xs text-gray-400">Sent to 248 residents</p>
              </div>
            </div>

            {/* Floating resolved badge */}
            <div className="floating-badge -bottom-4 -left-6 w-48">
              <div className="bg-emerald-100 p-2 rounded-xl shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Issue Resolved</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

function FeaturesSection() {
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

function HowItWorksSection() {
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

// ─── Benefits ─────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Zap,
    title: "Faster Problem Resolution",
    description: "Cut average resolution time by 60% with streamlined workflows and instant notifications.",
  },
  {
    icon: Users,
    title: "Better Communication",
    description: "Bridge the gap between residents and management with transparent, real-time updates.",
  },
  {
    icon: ClipboardList,
    title: "Organized Workflows",
    description: "Structured task assignment and tracking eliminates confusion and missed requests.",
  },
  {
    icon: Shield,
    title: "Improved Building Safety",
    description: "Instant emergency alerts and proactive maintenance keeps residents safe at all times.",
  },
] as const;

function BenefitsSection() {
  return (
    <section id="benefits" className="benefits-section">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Benefits"
          title="Why buildings choose Mulaky"
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

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="cta-section">
      <div className="max-w-4xl mx-auto">
        <div className="cta-card">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="cta-content">
            <h2 className="cta-title">Start Managing Your Community Smarter</h2>
            <p className="cta-desc">
              Join hundreds of buildings already using Mulaky to improve
              resident satisfaction and operational efficiency.
            </p>
            <div className="cta-actions">
              <a href="/login" className="cta-btn-primary">
                Create Account <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/login" className="cta-btn-secondary">Login</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <Building2 className="w-6 h-6 text-emerald-500" />
          <span className="footer-logo-text">Mulaky</span>
          <span className="footer-copyright">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <nav className="footer-nav">
          {["About Mulaky", "Contact", "Privacy Policy"].map((link) => (
            <a key={link} href="#" className="footer-link">{link}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="section-header">
      <span className="section-label">{label}</span>
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
