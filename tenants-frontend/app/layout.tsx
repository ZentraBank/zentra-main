import type { Metadata } from "next";
import "./globals.css";
import TenantProvider from "@/components/tenant/TenantProvider";

export const metadata: Metadata = {
  title: "ZentraBank",
  description: "White-label configurable banking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}