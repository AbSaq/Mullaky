import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/property/$propertyId")({
  component: RouteComponent,
});
function RouteComponent() {
  const { propertyId } = Route.useParams();
  return <div>Post ID: {propertyId}</div>;
}
