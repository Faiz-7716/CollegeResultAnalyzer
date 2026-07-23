"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGraduationCap, IconBarChart3, IconUsers, IconPlusCircle } from "./Icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isPathActive = (path: string) => pathname === path;
  const activeClass = (path: string) => isPathActive(path) ? "active" : "";

  return (
    <header className="main-header" style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-color)" }}>
      <div className="container nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "70px" }}>
        
        <Link href="/" className="nav-logo" onClick={closeMenu} style={{ fontSize: "1.25rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ padding: "0.35rem", background: "var(--accent-gradient)", borderRadius: "var(--radius-sm)", color: "#FFFFFF", display: "flex" }}>
            <IconGraduationCap size={22} color="#FFFFFF" />
          </div>
          <span className="text-gradient">Score Analyze</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/" className={`nav-link ${activeClass("/")}`} style={linkStyle(isPathActive("/"))}>
            <IconBarChart3 size={18} color={isPathActive("/") ? "var(--accent-primary)" : "var(--text-secondary)"} />
            <span>Dashboard</span>
          </Link>
          <Link href="/students" className={`nav-link ${activeClass("/students")}`} style={linkStyle(isPathActive("/students"))}>
            <IconUsers size={18} color={isPathActive("/students") ? "var(--accent-primary)" : "var(--text-secondary)"} />
            <span>Students</span>
          </Link>
          <Link href="/data-entry" className={`nav-link ${activeClass("/data-entry")}`} style={linkStyle(isPathActive("/data-entry"))}>
            <IconPlusCircle size={18} color={isPathActive("/data-entry") ? "var(--accent-primary)" : "var(--text-secondary)"} />
            <span>Data Entry</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="hamburger-btn" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isOpen ? "open-1" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open-2" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open-3" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`mobile-nav ${isOpen ? "open" : ""}`}>
        <nav style={{ display: "flex", flexDirection: "column", padding: "1rem" }}>
          <Link href="/" className={`mobile-nav-link ${activeClass("/")}`} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconBarChart3 size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/students" className={`mobile-nav-link ${activeClass("/students")}`} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconUsers size={18} />
            <span>Students</span>
          </Link>
          <Link href="/data-entry" className={`mobile-nav-link ${activeClass("/data-entry")}`} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconPlusCircle size={18} />
            <span>Data Entry</span>
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .desktop-nav {
          display: flex;
        }
        
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 110;
        }

        .hamburger-line {
          width: 30px;
          height: 3px;
          background: var(--text-primary);
          border-radius: 10px;
          transition: all 0.3s linear;
          position: relative;
          transform-origin: 1px;
        }

        .open-1 { transform: rotate(45deg); }
        .open-2 { opacity: 0; transform: translateX(20px); }
        .open-3 { transform: rotate(-45deg); }

        .mobile-nav {
          display: none;
          position: absolute;
          top: 70px;
          left: 0;
          width: 100%;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: max-height 0.3s ease-in-out;
          max-height: 0;
        }

        .mobile-nav.open {
          max-height: 300px;
        }

        .mobile-nav-link {
          padding: 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.2s;
        }

        .mobile-nav-link:last-child {
          border-bottom: none;
        }

        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: var(--bg-primary);
          color: var(--accent-primary);
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex;
          }
          .mobile-nav {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}

function linkStyle(isActive: boolean) {
  return {
    color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    transition: "color var(--transition-fast)"
  };
}
