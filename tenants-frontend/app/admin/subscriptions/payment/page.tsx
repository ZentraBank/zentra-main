import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { ArrowRight, Copy, CreditCard } from "lucide-react";

export default function SubscriptionPaymentPage() {
  return (
    <AppShell>
      <div
        className="min-h-[calc(100vh-6rem)] rounded-3xl p-5 text-white md:p-8"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 16%), linear-gradient(135deg, var(--tenant-primary), #020617 75%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/60">Cards</p>

            <h1 className="mt-8 max-w-md text-4xl font-extrabold leading-tight md:text-5xl">
              Purchase with cryptocurrency
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/85">
              After this purchase, you will enjoy this online banking service
              for the next 1 month. Re-subscribe if yours is expired.
            </p>

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-4">
                <CreditCard size={42} />
                <div>
                  <p className="text-sm text-white/70">Payment method</p>
                  <h2 className="text-xl font-bold">Cryptocurrency</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-black/25 p-5 shadow-2xl backdrop-blur">
            <div
              className="mb-5 rounded-2xl p-5 text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--tenant-primary), #16a34a)",
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Info label="Purchase Amount" value="$30" />
                <Info label="Card Type" value="Virtual" />
                <Info label="Payment Method" value="Cryptocurrency" />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 text-gray-900">
              <h2 className="font-bold">Crypto wallet address:</h2>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <p className="truncate text-sm">shaoDLKJSjILIDJ38793q9xn</p>
                <Copy size={18} className="text-tenant" />
              </div>

              <p className="mt-3 text-sm font-semibold">TON Blockchain</p>

              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-gray-600">
                <li>Please make this payment using the TON network.</li>
                <li>
                  You will be redirected outside our application to make the
                  payment using your cryptocurrency wallet.
                </li>
                <li>
                  Upon successful payment, come back and upload your payment
                  receipts for verification and confirmation.
                </li>
              </ul>

              <Link
                href="/subscriptions/success"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-tenant px-4 py-3 text-sm font-bold text-white"
              >
                Proceed to pay
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/75">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}