import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { userStatusQueryOptions } from "../../features/auth/queries/userQueries";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(
      userStatusQueryOptions(),
    );

    if (location.pathname === "/") {
      return;
    }
    if (!user.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (!user.isVerified && location.pathname !== "/verify-email") {
      throw redirect({ to: "/verify-email" });
    }

    if (user.isVerified && location.pathname === "/verify-email") {
      throw redirect({ to: user.targetRoute });
    }

    return { user };
  },
  component: () => <Outlet />,
});
