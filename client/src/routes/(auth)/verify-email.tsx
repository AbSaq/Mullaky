import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailPage } from "../../features/auth/components/VerifyEmailPage.tsx";

export const Route = createFileRoute("/(auth)/verify-email")({
  component: VerifyEmailPage,
});
