import type { Metadata } from "next";
import "./globals.css";
import TenantProvider from "@/components/tenant/TenantProvider";
import { sfPro } from "./fonts";

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
    <html lang="en" className={sfPro.variable}>
      <body className="font-sf antialiased">
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}