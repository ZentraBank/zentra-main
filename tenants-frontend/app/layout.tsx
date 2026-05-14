import type { Metadata } from "next";
import "./globals.css";
import TenantProvider from "@/components/tenant/TenantProvider";
import MobileNavbar from "@/components/layout/MobileNavbar";
import Navbar from "@/components/layout/Navbar";
export const metadata: Metadata = {
  title: "ZentraBank",
  description: "White-label configurable banking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sf antialiased">
        <TenantProvider>
          <Navbar />
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}