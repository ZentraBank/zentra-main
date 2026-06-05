// components/layout/NavbarWrapper.tsx

"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/subscribe") || pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}