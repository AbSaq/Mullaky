import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "../Navbar/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock TanStack Router link components so they don't throw rendering errors
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

describe("Frontend Navbar Layout Testing Suite", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Stops tests hanging on error steps
    },
  });

  it("should render both Login and Register actions when an unauthenticated anonymous response context hits the app", () => {
    const defaultAnonymousProps: any = {
      user: {
        isAuthenticated: false,
        isVerified: false,
        role: "user",
        targetRoute: "/",
      },
      variant: "landing",
    };

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Navbar {...defaultAnonymousProps} />
      </QueryClientProvider>,
    );

    expect(getByText(/login/i)).toBeInTheDocument();
    expect(getByText(/register/i)).toBeInTheDocument();
  });

  it("should conceal standard fallback onboarding triggers and switch to the UserMenu dropdown shell once user is authenticated", () => {
    const authenticatedOwnerProps: any = {
      user: {
        isAuthenticated: true,
        isVerified: true,
        role: "owner",
        targetRoute: "/dashboard",
        user: { fullName: "Test Owner" },
      },
      variant: "authenticated",
    };

    const { queryByText, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Navbar {...authenticatedOwnerProps} />
      </QueryClientProvider>,
    );

    expect(queryByText(/register/i)).not.toBeInTheDocument();
    // @ts-ignore
    expect(getByText(/test owner/i || /dashboard/i)).toBeInTheDocument();
  });
});
