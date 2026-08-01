"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Bell,
  MessageCircle,
  LogOut,
  X,
} from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const customerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Chat", href: "/chat", icon: MessageCircle },
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
            type="button"
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
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    closeSidebar();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E8B57] font-bold text-white">
            Z
          </div>

          <div>
            <h1 className="text-sm font-bold text-white">ZentraBank</h1>
            <p className="text-xs text-gray-400">
              Customer Portal
            </p>
          </div>
        </div>

        <button type="button" onClick={closeSidebar} className="text-white md:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1">
        <NavSection title="Customer" items={customerNavItems} />
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
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
  }[];
}) {
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const pathname = usePathname();

  return (
    <div>
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#2E8B57] text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
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