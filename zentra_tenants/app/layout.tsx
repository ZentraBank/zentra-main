import type { Metadata } from "next";
import "./globals.css";
import TenantProvider from "@/components/tenant/TenantProvider";
import AuthProvider from "@/components/auth/AuthProvider";

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
    <html lang="en" className="h-full overflow-x-hidden antialiased">
      <body className="flex min-h-full flex-col">
        <TenantProvider>
          <AuthProvider>{children}</AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
