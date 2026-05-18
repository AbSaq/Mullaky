import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "../../features/auth/components/RegisterPage.tsx";

export const Route = createFileRoute("/(auth)/register")({
  component: RegisterPage,
});
