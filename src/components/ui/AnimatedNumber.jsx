"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function AnimatedNumber({ value, prefix = "", suffix = "", className = "" }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    return prefix + Math.round(current).toLocaleString() + suffix;
  });

  const [flash, setFlash] = useState(null);
  const prevValue = useRef(value);

  useEffect(() => {
    spring.set(value);
    
    if (prevValue.current !== undefined && prevValue.current !== null && prevValue.current !== value) {
      const type = value > prevValue.current ? "success" : "warning";
      setFlash(type);
      prevValue.current = value;
      
      const timer = setTimeout(() => {
        setFlash(null);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      prevValue.current = value;
    }
  }, [spring, value]);

  const flashClasses = {
    success: "text-[var(--color-success)] drop-shadow-[0_0_8px_var(--color-success-glow)] scale-105 font-bold transition-all duration-300",
    warning: "text-[var(--color-warning)] drop-shadow-[0_0_8px_var(--color-warning-glow)] scale-105 font-bold transition-all duration-300"
  };

  return (
    <motion.span 
      className={cn("transition-all duration-500", className, flash && flashClasses[flash])}
    >
      {display}
    </motion.span>
  );
}
