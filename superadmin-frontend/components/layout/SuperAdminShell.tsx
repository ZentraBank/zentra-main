"use client";

import { useState } from "react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

export default function SuperAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eef4ff]">
      <SuperAdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <SuperAdminTopbar onOpenMenu={() => setMobileOpen(true)} />
        <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
