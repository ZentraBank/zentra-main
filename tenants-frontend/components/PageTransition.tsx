"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
     <motion.div
        key={pathname}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-screen"
        >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}