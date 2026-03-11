import * as React from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-lg shadow-emerald-300/50 dark:shadow-emerald-900/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      <DarkModeToggle />
    </React.Fragment>
  );
}
