"use client";
import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Trash2, UserPlus } from "lucide-react";
import { bankingService } from "@/services/banking.service";
import { getApiErrorMessage } from "@/lib/api";
import type { Beneficiary } from "@/types/banking.types";

export default function BeneficiariesPage(){
 const [items,setItems]=useState<Beneficiary[]>([]); const [accountNumber,setAccountNumber]=useState(""); const [displayName,setDisplayName]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const load=async()=>{try{setItems(await bankingService.listBeneficiaries());}catch(e){setError(getApiErrorMessage(e,"Unable to load beneficiaries."));}};
 useEffect(()=>{void load();},[]);
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{await bankingService.createInternalBeneficiary({accountNumber,displayName});setAccountNumber("");setDisplayName("");await load();}catch(err){setError(getApiErrorMessage(err,"Unable to add beneficiary."));}finally{setBusy(false);}};
 const remove=async(id:string)=>{setBusy(true);try{await bankingService.deleteBeneficiary(id);setItems(v=>v.filter(x=>x.id!==id));}catch(e){setError(getApiErrorMessage(e,"Unable to remove beneficiary."));}finally{setBusy(false);}};
 return <AppShell><div className="mb-6"><h1 className="text-2xl font-bold">Beneficiaries</h1><p className="text-sm text-gray-500">Save internal ZentraBank accounts for faster transfers.</p></div>{error&&<div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-[1fr_1fr_auto]"><input value={accountNumber} onChange={e=>setAccountNumber(e.target.value.replace(/\D/g,""))} placeholder="Account number" minLength={8} maxLength={20} required className="rounded-xl border px-4 py-3"/><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Display name (optional)" className="rounded-xl border px-4 py-3"/><button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-tenant px-5 py-3 font-semibold text-white"><UserPlus size={18}/>Add</button></form>
 <div className="space-y-3">{items.length===0?<div className="rounded-2xl border bg-white p-8 text-center text-gray-500">No beneficiaries saved.</div>:items.map(b=><div key={b.id} className="flex items-center gap-4 rounded-2xl border bg-white p-4"><div className="min-w-0 flex-1"><p className="font-bold">{b.display_name||b.account_name}</p><p className="text-sm text-gray-500">{b.account_number} · {b.bank_name||"ZentraBank"} · {b.currency}</p></div><button onClick={()=>void remove(b.id)} disabled={busy} className="rounded-xl p-3 text-red-600 hover:bg-red-50"><Trash2 size={18}/></button></div>)}</div></AppShell>;
}
