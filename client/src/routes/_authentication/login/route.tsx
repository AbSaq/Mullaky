import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "./-login-page.tsx";
import { userQueryOptions } from "../../../features/auth/loginMutation.ts";

export const Route = createFileRoute("/_authentication/login")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions);

    if (user) {
      throw redirect({ to: "/property" });
    }
  },
  component: LoginPage,
});
