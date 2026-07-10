import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4ff] p-5">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-[0_25px_70px_rgba(15,31,70,0.12)]">
        <p className="text-sm font-bold text-[#2458e8]">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Forgot password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter your authorised Superadmin email address. Backend integration
          will send a secure recovery link.
        </p>
        <input
          type="email"
          placeholder="superadmin@zentrabank.com"
          className="mt-7 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#2458e8]"
        />
        <button className="mt-4 h-12 w-full rounded-xl bg-[#2458e8] font-bold text-white">
          Send recovery link
        </button>
        <Link href="/login" className="mt-6 block text-center text-sm font-bold text-[#2458e8]">
          Return to login
        </Link>
      </div>
    </main>
  );
}
