import { createFileRoute, getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_authenticated");

export const Route = createFileRoute("/_authenticated/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = routeApi.useRouteContext();

  return <div>Welcome, {user.name}</div>;
}
