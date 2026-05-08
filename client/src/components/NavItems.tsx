import { Link } from "@tanstack/react-router";

type NavItem =
  | { type: "link"; href: string; label: string }
  | { type: "route"; to: string; label: string };

export const DesktopNavItem = ({ item }: { item: NavItem }) => {
  if (item.type === "link") {
    return (
      <a href={item.href} className="navbar-nav-link">
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to} className="navbar-nav-link">
      {item.label}
    </Link>
  );
};

export const MobileNavItem = ({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) => {
  if (item.type === "link") {
    return (
      <a href={item.href} className="navbar-mobile-link" onClick={onClose}>
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to} className="navbar-mobile-link" onClick={onClose}>
      {item.label}
    </Link>
  );
};
