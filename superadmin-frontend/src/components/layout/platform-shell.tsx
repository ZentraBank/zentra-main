"use client";

import { useState } from "react";
import { PlatformHeader } from "./platform-header";
import { PlatformSidebar } from "./platform-sidebar";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <PlatformSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[280px]">
        <PlatformHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="min-h-[calc(100vh-80px)]">{children}</div>
      </div>
    </div>
  );
}
