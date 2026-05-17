import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "../../components/Navbar/Navbar.tsx";
import { HeroSection } from "./-hero-section.tsx";
import { FeaturesSection } from "./-features-section.tsx";
import { HowItWorksSection } from "./-how-it-works-section.tsx";
import { BenefitsSection } from "./-benefits-section.tsx";
import { Footer } from "./-footer-section.tsx";
import { CTASection } from "./-cta-section.tsx";
import { userStatusQueryOptions } from "../../features/auth/queries/userQueries.ts";

export const Route = createFileRoute("/home/")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      userStatusQueryOptions(),
    );
    return { user };
  };,
  component: LandingPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function LandingPage() {
  const { user } = Route.useRouteContext();
  return (
    <div className="landing-page">
      <Navbar variant="landing" user={user} />
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
