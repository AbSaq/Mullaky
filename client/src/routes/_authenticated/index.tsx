import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user || !user.isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (!user.isVerified) {
      throw redirect({ to: "/verify-email" });
    }

    throw redirect({ to: user.targetRoute });
  },
});
