import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../../features/auth/components/LoginPage.tsx";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
});
