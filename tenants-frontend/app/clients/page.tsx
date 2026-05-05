import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { Plus, Search, MessageCircle, ChevronRight } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "Gregory Winter",
    desc: "An upcoming philanthropist",
    status: "Read",
  },
  {
    id: 2,
    name: "Client’s name here",
    desc: "An overview of first few words of the client...",
    status: "Unread",
  },
  {
    id: 3,
    name: "Client’s name here",
    desc: "An overview of first few words of the client...",
    status: "Personal",
  },
];

export default function ClientsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Clients</h1>
          <p className="text-sm text-gray-500">
            Manage clients, profiles, and support conversations.
          </p>
        </div>

        <Link
          href="/clients/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-tenant px-4 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Add Client
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Read", "Unread", "Personal"].map((tab) => (
          <button
            key={tab}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-tenant hover:text-white"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search client"
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {clients.map((client) => (
          <div
            key={client.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tenant text-sm font-bold text-white">
                {client.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-bold">{client.name}</h2>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                    {client.status}
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {client.desc}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                href={`/clients/${client.id}`}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:border-tenant hover:text-tenant"
              >
                View Profile
              </Link>

              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-tenant px-4 py-2 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} />
                Chat
              </Link>

              <Link
                href={`/clients/${client.id}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}