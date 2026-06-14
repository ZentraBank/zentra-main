import type { Metadata } from "next";
import "./globals.css";
// import { sfPro, lato } from "./fonts";
import TenantProvider from "@/components/tenant/TenantProvider";
import PageTransition from "@/components/PageTransition";

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
      <body className="font-sf antialiased overflow-x-hidden">
        <TenantProvider>
          <PageTransition>{children}</PageTransition>
        </TenantProvider>
      </body>
    </html>
  );
}