import type { Metadata } from "next";
import "./globals.css";
import TenantProvider from "@/components/tenant/TenantProvider";
import PageTransition from "@/components/PageTransition";

// import NavbarWrapper from "@/components/layout/NavbarWrapper";

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
        <PageTransition>
        <TenantProvider>
          {/* <NavbarWrapper /> */}
          {children}
        </TenantProvider>
        </PageTransition>
      </body>
    </html>
  );
}