"use client";

import { Bell, Menu } from "lucide-react";

import { useUIStore } from "@/store/ui.store";

export default function Topbar() {

  const openSidebar = useUIStore((state) => state.openSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-black px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 md:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-white">ZentraBank</h1>
          <p className="text-xs text-gray-500">Welcome back</p>
        </div>
      </div>

      <button className="relative rounded-full bg-gray-100 p-2 text-gray-700">
        <Bell size={18} />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-tenant" />
      </button>
    </header>
  );
}