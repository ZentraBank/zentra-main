"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { cardService } from "@/services/card.service";
import type { ClientCard } from "@/types/card";

const actions = [
  { title: "All Cards", icon: "/images/active-cards.png", href: "/cards/active-cards" },
  { title: "Get Virtual Card", icon: "/images/virtual-cards.png", href: "/cards/cards-purchase" },
  { title: "Transaction PIN", icon: "/images/limits-control.png", href: "/transaction-pin" },
  { title: "Card Security", icon: "/images/quick-settings.png", href: "/cards/active-cards" },
];
export default function CardsHomePage(){
 const [cards,setCards]=useState<ClientCard[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{cardService.listMine().then(setCards).catch(e=>setError(e instanceof Error?e.message:"Unable to load cards.")).finally(()=>setLoading(false))},[]);
 const active=useMemo(()=>cards.filter(c=>c.status==="active").length,[cards]);
 return <main className="min-h-screen bg-[#E7EBF0] text-[#252525]"><section className="mx-auto max-w-[1180px] px-5 pb-[120px] pt-12 lg:px-8 lg:pb-12">
 <header className="relative flex items-center justify-center lg:justify-between"><Link href="/cards" className="absolute left-0 lg:static"><ArrowLeft size={22}/></Link><h1 className="text-xl font-bold">Cards</h1><Link href="/cards/cards-purchase" className="hidden h-11 items-center gap-2 rounded-full bg-[#2458E8] px-5 text-sm font-semibold text-white lg:flex"><Plus size={16}/>New Card</Link></header>
 <div className="mt-8 grid gap-6 lg:grid-cols-12"><section className="grid items-center gap-4 rounded-[30px] bg-white p-6 shadow-sm lg:col-span-7 lg:grid-cols-2 lg:p-8"><div><h2 className="text-[34px] font-black leading-tight text-[#617DB7] lg:text-[54px]">Simplify Payments with Virtual Cards</h2><p className="mt-4 text-black/55">Issue secure cards linked to your live ZentraBank account.</p><Link href="/cards/cards-purchase" className="mt-6 flex h-12 w-52 items-center justify-center gap-3 rounded-2xl bg-[#2458E8] font-semibold text-white">Create a card<ArrowRight size={18}/></Link></div><div className="relative h-64"><Image src="/images/cards-avatar.png" alt="Cards" fill className="object-contain"/></div></section>
 <aside className="space-y-6 lg:col-span-5"><section className="grid grid-cols-4 gap-3 rounded-[30px] bg-white p-5 shadow-sm">{actions.map(a=><Link key={a.title} href={a.href} className="text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F3FFF8]"><Image src={a.icon} alt="" width={38} height={38}/></div><p className="mt-2 text-xs font-medium text-[#38B974]">{a.title}</p></Link>)}</section><section className="rounded-[30px] bg-white p-6 shadow-sm"><div className="flex justify-between"><div><p className="text-sm text-black/45">Issued cards</p><p className="text-3xl font-black">{cards.length}</p></div><div className="text-right"><p className="text-sm text-black/45">Active</p><p className="text-3xl font-black text-[#2458E8]">{active}</p></div></div></section></aside></div>
 <section className="mt-6 rounded-[30px] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xl font-bold">Your cards</h3><Link href="/cards/active-cards" className="text-sm font-semibold text-[#2458E8]">See all</Link></div>{error&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading?<div className="grid h-48 place-items-center"><Loader2 className="animate-spin text-[#2458E8]"/></div>:cards.length===0?<div className="py-12 text-center text-sm text-black/50">No cards issued yet.</div>:<div className="mt-5 flex gap-4 overflow-x-auto pb-3">{cards.map(c=><Link key={c.id} href={`/cards/details/${c.id}`} className="min-w-[290px] rounded-[24px] bg-gradient-to-br from-[#1D4ED8] to-[#12285f] p-5 text-white shadow-lg"><div className="flex justify-between"><strong className="capitalize">{c.card_type.replaceAll("_"," ")}</strong><span className="text-xs capitalize">{c.status}</span></div><p className="mt-10 tracking-[.15em]">{c.masked_pan}</p><p className="mt-5 text-xs">Expires {String(c.expiry_month).padStart(2,"0")}/{String(c.expiry_year).slice(-2)}</p></Link>)}</div>}</section>
 </section><div className="lg:hidden"><BottomNav/></div></main>
}
