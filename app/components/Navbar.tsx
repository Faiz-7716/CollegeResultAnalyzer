"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGraduationCap,
  IconBarChart3,
  IconUsers,
  IconPlusCircle,
  IconChevronRight,
} from "./Icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isPathActive = (path: string) => pathname === path;
  const activeClass = (path: string) => (isPathActive(path) ? "active" : "");

  // Close mobile sidebar on window resize if resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className="main-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          className="container nav-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "70px",
          }}
        >
          <Link
            href="/"
            className="nav-logo"
            onClick={closeMenu}
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
            }}
          >
            <img
              src="/logo.png"
              alt="MUC CS Logo"
              style={{ height: "38px", width: "auto", objectFit: "contain", borderRadius: "var(--radius-sm)" }}
            />
            <span className="text-gradient" style={{ letterSpacing: "-0.01em" }}>
              MUC CS Result
            </span>
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
      </header>

      {/* Backdrop Overlay for Mobile Sidebar */}
      <div
        className={`mobile-backdrop ${isOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      {/* Mobile Slide-Over Sidebar Drawer */}
      <aside className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Sidebar Top Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <img
                src="/logo.png"
                alt="MUC CS Logo"
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
              />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                MUC CS Result
              </span>
            </div>

            <button
              onClick={closeMenu}
              style={{
                background: "rgba(241, 245, 249, 0.8)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
              }}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Sidebar Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.5rem", flex: 1 }}>
            <Link
              href="/"
              className={`sidebar-link ${isPathActive("/") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <IconBarChart3 size={20} color={isPathActive("/") ? "#FFFFFF" : "var(--text-secondary)"} />
                <span>Dashboard</span>
              </div>
              <IconChevronRight size={16} opacity={isPathActive("/") ? 1 : 0.4} />
            </Link>

            <Link
              href="/students"
              className={`sidebar-link ${isPathActive("/students") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <IconUsers size={20} color={isPathActive("/students") ? "#FFFFFF" : "var(--text-secondary)"} />
                <span>Students Roster</span>
              </div>
              <IconChevronRight size={16} opacity={isPathActive("/students") ? 1 : 0.4} />
            </Link>

            <Link
              href="/data-entry"
              className={`sidebar-link ${isPathActive("/data-entry") ? "active" : ""}`}
              onClick={closeMenu}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <IconPlusCircle size={20} color={isPathActive("/data-entry") ? "#FFFFFF" : "var(--text-secondary)"} />
                <span>Data Entry Hub</span>
              </div>
              <IconChevronRight size={16} opacity={isPathActive("/data-entry") ? 1 : 0.4} />
            </Link>
          </nav>

          {/* Sidebar Footer Information */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(79, 70, 229, 0.05)",
              border: "1px solid rgba(79, 70, 229, 0.15)",
              borderRadius: "var(--radius-md)",
              marginTop: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
              <IconGraduationCap size={16} />
              <span>Dept. of Computer Science</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 500 }}>
              Mazharul Uloom College
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Batch: <strong>31924U180</strong>
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .desktop-nav {
          display: flex;
        }

        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 32px;
          height: 26px;
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

        /* Mobile Backdrop Overlay */
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Slide-Over Sidebar Drawer */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 290px;
          max-width: 85vw;
          background: #FFFFFF;
          z-index: 210;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          padding: 1.5rem;
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: rgba(241, 245, 249, 0.8);
          color: var(--accent-primary);
        }

        .sidebar-link.active {
          background: var(--accent-gradient);
          color: #FFFFFF !important;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex;
          }
        }
      `}</style>
    </>
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
    transition: "color var(--transition-fast)",
  };
}
