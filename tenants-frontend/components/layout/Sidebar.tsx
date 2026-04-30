"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Bell,
  MessageCircle,
  LogOut,
  X,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { useUIStore } from "@/store/ui.store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    feature: "transfers",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    feature: "notifications",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageCircle,
    feature: "chat",
  },
];

function SidebarContent() {
  const tenant = useTenantStore((state) => state.tenant);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.app_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tenant font-bold text-white">
              {tenant?.app_name?.charAt(0) || "Z"}
            </div>
          )}

          <div>
            <h1 className="text-sm font-bold text-gray-900">
              {tenant?.app_name || "ZentraBank"}
            </h1>
            <p className="text-xs text-gray-500">Tenant Portal</p>
          </div>
        </div>

        <button onClick={closeSidebar} className="lg:hidden">
          <X size={20} />
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isEnabled =
            !item.feature ||
            !tenant?.tenant_features ||
            tenant.tenant_features.find(
              (feature) => feature.key === item.feature
            )?.enabled !== false;

          if (!isEnabled) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="absolute bottom-6 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut size={18} />
        Logout
      </button>
    </>
  );
}

export default function Sidebar() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-gray-200 bg-white p-5 lg:block">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            onClick={closeSidebar}
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar"
          />

          <aside className="relative h-full w-72 bg-white p-5 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}