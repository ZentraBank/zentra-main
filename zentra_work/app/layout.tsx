import type { Metadata } from "next";
import { Geist, Geist_Mono,Roboto } from "next/font/google";

import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import TenantProvider from "@/providers/TenantProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
  variable: "--font-roboto", 
});

export const metadata: Metadata = {
  title: "ZentraBank",
  description: "Secure multi-tenant digital banking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased` }
    >
      <body className="min-h-full flex flex-col">
        <TenantProvider>
          <AuthProvider>{children}</AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
