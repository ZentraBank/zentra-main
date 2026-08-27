"use client";

import Link from "next/link";
import {
  Building2,
  Globe2,
  Palette,
  MapPin,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

const settings = [
  {
    title: "Organisation",
    description:
      "Manage your organisation name, contact details and tenant profile.",
    icon: Building2,
    href: "/dashboard/settings/organisation",
  },
  {
    title: "Branding",
    description:
      "Manage your app name, logo and brand colours.",
    icon: Palette,
    href: "/dashboard/settings/branding",
  },
  {
    title: "Domains",
    description:
      "Connect your business domain and manage your temporary ZentraBank address.",
    icon: Globe2,
    href: "/dashboard/settings/domains",
  },
  {
    title: "Localisation",
    description:
      "Manage country, currency and timezone settings.",
    icon: MapPin,
    href: "/dashboard/settings/localisation",
  },
];

export default function TenantSettingsPage() {
  return (
    <AppShell>
      <main className="min-h-[calc(100svh-80px)] rounded-3xl bg-black px-5 py-6 text-white md:px-8">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/45">
              Tenant administration
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Manage your organisation,
              branding, business domain and
              localisation settings.
            </p>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {settings.map(
              ({
                title,
                description,
                icon: Icon,
                href,
              }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        {title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}