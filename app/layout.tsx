import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "PARA PO â€” Community transport information for Filipino commuters",
  description:
    "PARA PO is a mobile-first transport information preview: demo map, fictional route search, and sample reports and alerts. Live tracking and accounts arrive in later phases.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-surface text-asphalt antialiased">
        <ServiceWorkerRegister />
        <Navbar userEmail={user?.email ?? null} />
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-24 md:pt-6 md:pb-8">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
