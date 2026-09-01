"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function AnimatedNumber({ value, prefix = "", suffix = "", className = "" }) {
  const numericValue = typeof value === 'number' ? value : (Number(value) || 0);
  const isInitial = useRef(true);
  const spring = useSpring(numericValue, { mass: 0.5, stiffness: 90, damping: 18 });
  const display = useTransform(spring, (current) => {
    return prefix + Math.round(current).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    spring.set(numericValue);
  }, [spring, numericValue]);

  return (
    <motion.span className={cn("inline-block tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
