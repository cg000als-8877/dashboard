"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
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
