import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useLogin } from "../../features/auth/loginMutation";

import type { Inputs } from "../../features/auth/types.ts";

export const Route = createFileRoute("/_authentication/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
      console.log("trying to navigate");
      await navigate({ to: "/home" });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Welcome</h1>

        <form className="login-card__form" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("username")}
            type="text"
            placeholder="Username"
            className="login-card__input"
          />

          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="login-card__input login-card__input--last"
          />

          {loginMutation.isError && (
            <p className="login-card__error">
              {loginMutation.error.message || "Login failed"}
            </p>
          )}

          <button
            type="submit"
            className="login-card__button"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
