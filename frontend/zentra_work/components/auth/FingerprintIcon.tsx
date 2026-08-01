// components/auth/FingerprintIcon.tsx

import { Fingerprint } from "lucide-react";

export default function FingerprintIcon() {
  return (
    <div className="mx-auto my-10 flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
      <Fingerprint size={42} className="text-blue-500" />
    </div>
  );
}