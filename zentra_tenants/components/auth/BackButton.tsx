// components/auth/BackButton.tsx

"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm text-white" title="Left">
      <ArrowLeft size={18} />
    </button>
  );
}