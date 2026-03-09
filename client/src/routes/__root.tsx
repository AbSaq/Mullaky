import * as React from "react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">login</Link>
      </nav>
      <hr />
      <Outlet />
    </React.Fragment>
  );
}
