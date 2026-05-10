import { createFileRoute, redirect } from "@tanstack/react-router";

import { userQueryOptions } from "../../../features/auth/useUser.ts";
import type { LoginSearch } from "../../../types/auth.ts";

import LoginPage from "./-login-page.tsx";

export const Route = createFileRoute("/_authentication/login")({
  beforeLoad: async ({
    context,
    search,
  }: {
    context: any;
    search: LoginSearch;
  }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions);

    if (user) {
      throw redirect({ to: search.redirect || "/property" });
    }
  },
  component: LoginPage,
});
