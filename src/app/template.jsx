"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }) {
  const pathname = usePathname();

  // Disable spring transition on login page to eliminate entrance flash
  if (pathname === '/login') {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1 
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
