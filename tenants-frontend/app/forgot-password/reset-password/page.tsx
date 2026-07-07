"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordIsAlphanumeric =
    /[A-Za-z]/.test(password) && /\d/.test(password);

  const canSubmit =
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword &&
    passwordIsAlphanumeric;

  const handleResetPassword = () => {
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!passwordIsAlphanumeric) {
      setError("Password must contain both letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Later: call backend reset password endpoint here.
    router.push("/login");
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 py-8 text-white"
      style={{
        backgroundImage: "url('/images/Background_2.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top right",
      }}
    >
      <div className="absolute inset-0 bg-black/25" />

      <Link
        href="/forgot-password/otp"
        className="absolute left-4 top-10 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
      >
        <ArrowLeft size={21} />
      </Link>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[430px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/15 bg-black/80 px-5 pb-7 pt-7 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#2458e8] shadow-lg">
            <LockKeyhole size={27} />
          </div>

          <h1 className="text-center text-[27px] font-black leading-none">
            Reset Password
          </h1>

          <p className="mx-auto mt-3 max-w-[300px] text-center text-[14px] leading-[19px] text-white/75">
            Create a new alphanumeric password before logging back into your
            account.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-[13px] font-bold text-white/90">
                New Password
              </label>

              <div className="mt-2 flex h-[50px] items-center rounded-[14px] bg-white px-4">
                <input
                  title="New password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  className="flex-1 bg-transparent text-[14px] font-bold text-black outline-none placeholder:text-black/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-black/50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-bold text-white/90">
                Confirm Password
              </label>

              <div className="mt-2 flex h-[50px] items-center rounded-[14px] bg-white px-4">
                <input
                  title="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  className="flex-1 bg-transparent text-[14px] font-bold text-black outline-none placeholder:text-black/40"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-black/50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-[17px] text-white/60">
            Password must be at least 6 characters and include both letters and
            numbers.
          </p>

          {error && (
            <p className="mt-3 text-center text-[12px] font-semibold text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleResetPassword}
            className={`mt-8 h-[50px] w-full rounded-[14px] text-[15px] font-black text-white shadow-lg transition ${
              canSubmit
                ? "bg-[#2458e8] hover:bg-[#1f4bc7]"
                : "cursor-not-allowed bg-[#6f6f6f] text-white/45"
            }`}
          >
            Reset Password
          </button>

          <Link
            href="/login"
            className="mt-5 block text-center text-[13px] font-bold text-white/70"
          >
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}