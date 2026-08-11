import AppShell from "@/components/layout/AppShell";
import { Search, UserPlus } from "lucide-react";

const users = [
  {
    name: "Gregory Winter",
    email: "gregorywinter@yahoo.com",
    role: "customer",
    status: "Active",
  },
  {
    name: "Tenant Admin",
    email: "admin@test.com",
    role: "tenant_admin",
    status: "Active",
  },
];

export default function AdminUsersPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500">
            Manage tenant users and role access.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-tenant px-4 py-3 text-sm font-semibold text-white">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search users"
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {users.map((user) => (
          <div
            key={user.email}
            className="flex flex-col gap-3 border-b border-gray-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {user.role}
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                {user.status}
              </span>

              <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}