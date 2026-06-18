"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Bell,
  MessageCircle,
  LogOut,
  X,
  Users,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";

const customerNavItems = [
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
  { label: "Clients", href: "/clients", icon: Users },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Accounts", href: "/admin/accounts", icon: Wallet },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Chats", href: "/admin/chats", icon: MessageCircle },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
];

export default function Sidebar() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 overflow-y-auto border-r border-gray-200 !bg-black p-5 md:block">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            onClick={closeSidebar}
            className="absolute inset-0 !bg-black/40"
            aria-label="Close sidebar"
          />

          <aside className="relative h-full w-72 overflow-y-auto bg-black p-5 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent() {
  const tenant = useTenantStore((state) => state.tenant);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const user = useAuthStore((state) => state.user);

  const role = user?.role || "customer";

  const isAdmin = role === "tenant_admin" || role === "super_admin";

  const sidebarItems = isAdmin ? adminNavItems : customerNavItems;
  const sidebarTitle = isAdmin ? "Admin" : "Customer";

  return (
    <div className="flex min-h-full flex-col">
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
            <p className="text-xs text-gray-500">
              {isAdmin ? "Admin Portal" : "Tenant Portal"}
            </p>
          </div>
        </div>

        <button onClick={closeSidebar} className="md:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1">
        <NavSection title={sidebarTitle} items={sidebarItems} />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    feature?: string;
  }[];
}) {
  const tenant = useTenantStore((state) => state.tenant);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const pathname = usePathname();

  return (
    <div>
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const isEnabled =
            !item.feature ||
            !tenant?.tenant_features ||
            tenant.tenant_features.find(
              (feature) => feature.key === item.feature
            )?.enabled !== false;

          if (!isEnabled) return null;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-tenant text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}