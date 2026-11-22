"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "", 
  className = "",
  decimals = 0 
}) {
  const numericValue = typeof value === 'number' ? value : (Number(value) || 0);
  const spring = useSpring(0, { mass: 0.5, stiffness: 75, damping: 15 });
  const [mounted, setMounted] = useState(false);

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return prefix + current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }
    return prefix + Math.round(current).toLocaleString() + suffix;
  });

  useEffect(() => {
    setMounted(true);
    spring.set(numericValue);
  }, [spring, numericValue]);

  return (
    <motion.span className={cn("inline-block tabular-nums", className)}>
      {mounted ? display : (
        prefix + (decimals > 0 ? numericValue.toFixed(decimals) : Math.round(numericValue).toLocaleString()) + suffix
      )}
    </motion.span>
  );
}
