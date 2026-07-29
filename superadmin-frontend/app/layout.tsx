import type { Metadata } from "next";
import { PlatformAuthProvider } from "@/src/context/platform-auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZentraBank Superadmin",
  description: "Platform-wide administration portal",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PlatformAuthProvider>{children}</PlatformAuthProvider></body>
    </html>
  );
}
