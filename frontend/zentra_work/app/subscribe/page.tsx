"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { subscriptionService } from "@/services/subscription.service";
import type { MySubscription, SubscriptionPlan } from "@/types/subscription";

export default function SubscribePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mine, setMine] = useState<MySubscription>({ subscription: null, openRequest: null });
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [availablePlans, current] = await Promise.all([
        subscriptionService.listPlans(),
        subscriptionService.getMine(),
      ]);
      setPlans(availablePlans);
      setMine(current);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const requestPlan = async (plan: SubscriptionPlan) => {
    setBusyCode(plan.code);
    setError("");
    setMessage("");
    try {
      await subscriptionService.startUpgrade(plan.code);
      setMessage(`${plan.name} request created. Submit payment proof through your tenant's supported payment channel.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request this plan.");
    } finally {
      setBusyCode("");
    }
  };

  return (
    <main className="min-h-screen bg-[#E7EBF0] px-4 py-10 text-[#333]">
      <section className="mx-auto max-w-[1100px]">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ArrowLeft size={20} /></Link>
          <div className="text-center"><h1 className="text-xl font-black lg:text-3xl">Subscription plans</h1><p className="mt-1 text-sm text-black/50">Choose the plan that unlocks the banking features you need.</p></div>
          <button onClick={() => void load()} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Refresh"><RefreshCw size={18} /></button>
        </header>

        {(error || message) && <div className={`mt-6 rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || message}</div>}

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2458E8]">Current status</p>
          <h2 className="mt-2 text-2xl font-black">{mine.subscription?.plan_name || "No active subscription"}</h2>
          {mine.subscription?.expires_at && <p className="mt-1 text-sm text-black/50">Expires {new Date(mine.subscription.expires_at).toLocaleDateString()}</p>}
          {mine.openRequest && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Open request: {mine.openRequest.status.replaceAll("_", " ")}</p>}
        </section>

        {loading ? <div className="grid min-h-[260px] place-items-center"><Loader2 className="animate-spin" /></div> : (
          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const active = mine.subscription?.plan_code === plan.code;
              return <article key={plan.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className="mt-3 text-3xl font-black text-[#2458E8]">{new Intl.NumberFormat(undefined, { style: "currency", currency: plan.currency }).format(Number(plan.price))}</p>
                <p className="text-sm text-black/45">per {plan.billing_interval}</p>
                <div className="mt-6 space-y-3 text-sm text-black/65"><p className="flex gap-2"><Check size={17} className="text-emerald-600" /> Tenant-configured banking access</p><p className="flex gap-2"><Check size={17} className="text-emerald-600" /> Transfer and card limits based on plan</p></div>
                <button disabled={active || Boolean(mine.openRequest) || busyCode === plan.code} onClick={() => void requestPlan(plan)} className="mt-7 flex h-12 w-full items-center justify-center rounded-2xl bg-[#2458E8] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busyCode === plan.code ? <Loader2 className="animate-spin" size={18} /> : active ? "Current plan" : mine.openRequest ? "Request pending" : "Choose plan"}</button>
              </article>;
            })}
          </section>
        )}
      </section>
    </main>
  );
}
