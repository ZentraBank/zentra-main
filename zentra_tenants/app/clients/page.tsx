"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listClients,
  type TenantClient,
} from "@/services/client.service";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ClientsContent() {
  const [clients, setClients] = useState<TenantClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadClients = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await listClients();

      setClients(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.full_name?.toLowerCase().includes(term) ||
        client.first_name?.toLowerCase().includes(term) ||
        client.last_name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  return (
    
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-2xl font-semibold">
                Clients
              </h1>

              <p className="mt-1 text-sm text-white/50">
                Manage clients registered under your tenant.
              </p>
            </div>
          </div>

          <Link
            href="/clients/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#07111f] transition hover:bg-white/90"
          >
            <Plus size={18} />
            Add Client
          </Link>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or phone"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
            />
          </div>

          <button
            type="button"
            onClick={() => void loadClients(true)}
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-white/60">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading clients...
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <UserRound
                size={24}
                className="text-white/50"
              />
            </div>

            <h2 className="text-lg font-semibold">
              {search ? "No clients found" : "No clients yet"}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-white/50">
              {search
                ? "Try another name, email address or phone number."
                : "Clients created under this tenant will appear here."}
            </p>

            {!search && (
              <Link
                href="/clients/add"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#07111f]"
              >
                <Plus size={17} />
                Create first client
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_0.8fr_90px] gap-4 border-b border-white/10 px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/40 md:grid">
              <span>Client</span>
              <span>Email</span>
              <span>Phone</span>
              <span>Status</span>
              <span />
            </div>

            <div className="divide-y divide-white/10">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.025] md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_90px] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <UserRound
                        size={18}
                        className="text-white/60"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {client.full_name ||
                          `${client.first_name} ${client.last_name}`}
                      </p>

                      <p className="mt-0.5 text-xs text-white/40">
                        Client ID: {client.id}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-white/40 md:hidden">
                      Email
                    </p>

                    <p className="truncate text-sm text-white/75">
                      {client.email}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-white/40 md:hidden">
                      Phone
                    </p>

                    <p className="text-sm text-white/75">
                      {client.phone || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-white/40 md:hidden">
                      Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        client.status === "active" &&
                        client.membership_status === "active"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {client.membership_status || client.status}
                    </span>
                  </div>

                  <div className="md:text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && clients.length > 0 && (
          <p className="mt-4 text-sm text-white/40">
            {filteredClients.length}{" "}
            {filteredClients.length === 1 ? "client" : "clients"}
          </p>
        )}
      </div>
    </main>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}