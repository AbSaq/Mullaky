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
            <Link to="/login" className="navbar-cta">
              Login
            </Link>
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
            <Link to="/login" className="navbar-mobile-cta">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
