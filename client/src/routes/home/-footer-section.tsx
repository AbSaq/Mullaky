import { Building2 } from "lucide-react";

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <Building2 className="w-6 h-6 text-emerald-500" />
          <span className="footer-logo-text">Mullaky</span>
          <span className="footer-copyright">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <nav className="footer-nav">
          {["About Mullaky", "Contact", "Privacy Policy"].map((link) => (
            <a key={link} href="#" className="footer-link">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
