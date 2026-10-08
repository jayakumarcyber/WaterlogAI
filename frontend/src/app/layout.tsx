import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CivicPulse Monsoon | AI Waterlogging Risk Management",
  description: "AI-Based Predictive Waterlogging & Drainage Risk Management System for Smart Municipal Authorities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8fafc] text-slate-900 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
