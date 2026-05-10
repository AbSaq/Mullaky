import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "../../features/auth/useUser.ts";
import { Navbar } from "../../components/Navbar/Navbar.tsx";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions);
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname + location.search + location.hash,
        },
      });
    }

    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  if (!user) {
    throw new Error("User not found in context");
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} variant="authenticated" />
      <div className="h-16" />
      {/* Spacer for fixed navbar */}
      <main className="pt-4">
        <Outlet />
      </main>
    </div>
  );
}
