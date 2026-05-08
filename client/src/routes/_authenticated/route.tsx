import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "../../features/auth/loginMutation.ts";
import { Navbar } from "../../components/Navbar.tsx";
import type { User } from "../../features/auth/types.ts";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions);
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          // where they were trying to go for post-login redirect
          redirect: location.href,
        },
      });
    }

    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext() as { user: User };

  if (!user) {
    throw new Error("User not found in context");
  }
  return (
    <div>
      <Navbar user={user} variant="authenticated" />
      <div className="h-16" />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
