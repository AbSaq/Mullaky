import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { userQueryOptions } from "../../features/auth/loginMutation.ts";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions);
    if (!user) throw redirect({ to: "/login" });

    return { user };
  },
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div>
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/login">login</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}
