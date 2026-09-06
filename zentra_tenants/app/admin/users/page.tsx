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
    <div className="mx-auto max-w-7xl px-4 py-8 text-neutral-900 md:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage tenant users and role access.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-neutral-400" />
        <input
          placeholder="Search users"
          className="w-full text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {users.map((user) => (
          <div
            key={user.email}
            className="flex flex-col gap-3 border-b border-neutral-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between transition hover:bg-neutral-50"
          >
            <div>
              <p className="font-bold text-neutral-900">{user.name}</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">
                {user.role}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                {user.status}
              </span>

              <button className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}