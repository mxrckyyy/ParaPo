import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "PARA PO — Community transport information for Filipino commuters",
  description:
    "PARA PO is a mobile-first transport information preview: demo map, fictional route search, and sample reports and alerts. Live tracking and accounts arrive in later phases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-surface text-asphalt antialiased">
        <Navbar />
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
