import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
