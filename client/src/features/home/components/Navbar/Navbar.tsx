import { Link } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { DesktopNavItem, MobileNavItem } from "./NavItems.tsx";
import { UserMenu } from "./UserMenu.tsx";
import type { UserStatusResponse } from "../../../auth/queries/userQueries.ts";
import "./navbar.css";

interface SharedNavbarProps {
  user?: UserStatusResponse | null;
  variant?: "landing" | "authenticated";
}

export function Navbar({
  user,
  variant = "landing",
}: Readonly<SharedNavbarProps>) {
  const [menuOpen, setMenuOpen] = useState(false);

  // 💡 Check explicit boolean status flag instead of raw object truthiness
  const isUserLoggedIn = !!user?.isAuthenticated;

  const navItems =
    variant === "landing"
      ? [
          { type: "link" as const, href: "#features", label: "features" },
          {
            type: "link" as const,
            href: "#how-it-works",
            label: "how it works",
          },
          { type: "link" as const, href: "#benefits", label: "benefits" },
        ]
      : [
          { type: "route" as const, to: "/", label: "Home" },
          { type: "route" as const, to: "/property", label: "Properties" },
        ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="navbar-logo-text">Mullaky</span>
        </div>

        <nav className="navbar-nav">
          {navItems.map((item) => (
            <DesktopNavItem
              key={item.type === "link" ? item.href : item.to}
              item={item}
            />
          ))}
        </nav>

        <div className="navbar-actions">
          {isUserLoggedIn && user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="navbar-hamburger"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.type === "link" ? item.href : item.to}
              item={item}
              onClose={() => setMenuOpen(false)}
            />
          ))}
          {isUserLoggedIn && user ? (
            <UserMenu user={user} isMobile />
          ) : (
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-center font-semibold text-gray-500 dark:text-gray-400 py-2 text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
