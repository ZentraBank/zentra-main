import type { Metadata } from "next";
import "./globals.css";
// import { sfPro, lato } from "./fonts";
import TenantProvider from "@/components/tenant/TenantProvider";
import PageTransition from "@/components/PageTransition";
import { Geist, Geist_Mono,Roboto } from "next/font/google";

export const metadata: Metadata = {
  title: "ZentraBank",
  description: "White-label configurable banking platform",
};

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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en"
    className={`font-sf antialiased overflow-x-hidden ${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased` }>
      <body className="min-h-full flex flex-col">
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}


