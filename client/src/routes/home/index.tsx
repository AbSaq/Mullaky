import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "../../features/home/components/Navbar/Navbar.tsx";
import { HeroSection } from "../../features/home/components/-hero-section.tsx";
import { FeaturesSection } from "../../features/home/components/-features-section.tsx";
import { HowItWorksSection } from "../../features/home/components/-how-it-works-section.tsx";
import { BenefitsSection } from "../../features/home/components/-benefits-section.tsx";
import { Footer } from "../../features/home/components/-footer-section.tsx";
import { CTASection } from "../../features/home/components/-cta-section.tsx";
import { userStatusQueryOptions } from "../../features/auth/queries/userQueries.ts";

export const Route = createFileRoute("/home/")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      userStatusQueryOptions(),
    );
    return { user };
  },
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
