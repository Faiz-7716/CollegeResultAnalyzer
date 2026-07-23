import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "MUC CS Result | Department of Computer Science",
  description: "Academic Performance & Ledger Tracking System for B.Sc. CS Department, Mazharul Uloom College (Batch 31924U180).",
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
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main className="container page-wrapper">
          {children}
        </main>
      </body>
    </html>
  );
}
