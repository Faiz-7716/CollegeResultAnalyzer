import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Academic Performance & Ledger Tracking System",
  description: "A production-ready system for the B.Sc. CS department, Mazharul Uloom College (31924U180).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <header className="main-header">
          <div className="container nav-container">
            <Link href="/" className="nav-logo">
              <span className="text-gradient">Score Analyze</span>
            </Link>
            <nav className="nav-links">
              <Link href="/" className="nav-link">Dashboard</Link>
              <Link href="/students" className="nav-link">Students</Link>
              <Link href="/data-entry" className="nav-link">Data Entry</Link>
            </nav>
          </div>
        </header>
        <main className="container page-wrapper">
          {children}
        </main>
      </body>
    </html>
  );
}
