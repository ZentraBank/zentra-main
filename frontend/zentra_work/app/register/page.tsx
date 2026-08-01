"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"", password:"", confirmPassword:"" });
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const update=(key:string,value:string)=>setForm(v=>({...v,[key]:value}));
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError(""); if(form.password!==form.confirmPassword){setError("Passwords do not match");return;} setLoading(true); try{const result=await authService.register(form); sessionStorage.setItem("zentra_registration_email",form.email); if(result.developmentCode) sessionStorage.setItem("zentra_development_code",result.developmentCode); router.push("/register/otp");}catch(err){setError(err instanceof Error?err.message:"Registration failed");}finally{setLoading(false);}};
  return <main className="min-h-screen bg-[#E8EEF3] px-4 py-10"><section className="mx-auto max-w-[430px] rounded-[18px] bg-white p-6 shadow-xl"><Link href="/login"><ArrowLeft size={20}/></Link><h1 className="text-center text-4xl font-bold text-[#555]">Sign up</h1><p className="mt-3 text-sm text-[#555]">Create your secure ZentraBank client account.</p><form onSubmit={submit} className="mt-6 space-y-4">{[["firstName","First name"],["lastName","Last name"],["email","Email"],["phone","Phone number"]].map(([k,l])=><input key={k} type={k==="email"?"email":"text"} value={(form as any)[k]} onChange={e=>update(k,e.target.value)} placeholder={l} required={k!=="phone"} className="h-11 w-full border-b px-2 outline-none focus:border-[#2458E8]"/>)}<input type="password" value={form.password} onChange={e=>update("password",e.target.value)} placeholder="Password (8+ characters, letters and numbers)" required className="h-11 w-full border-b px-2 outline-none"/><input type="password" value={form.confirmPassword} onChange={e=>update("confirmPassword",e.target.value)} placeholder="Confirm password" required className="h-11 w-full border-b px-2 outline-none"/>{error&&<p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-[10px] bg-[#2458E8] py-3 font-semibold text-white disabled:opacity-60">{loading?"Sending code...":"Sign up"}</button></form><p className="mt-5 text-center text-sm">Have an account? <Link className="text-[#2458E8]" href="/login">Login</Link></p></section></main>;
}
