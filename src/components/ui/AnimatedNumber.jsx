"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { toBengaliDigits } from "@/i18n/translations";

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
  const { isBangla } = useLanguage();

  // Localize prefix and suffix if Bangla
  const localizedPrefix = isBangla 
    ? prefix.replace(/\bBDT\b/g, '৳').replace(/BDT/g, '৳')
    : prefix;
  const localizedSuffix = isBangla
    ? suffix.replace(/\bPCS\b/g, 'পিস').replace(/\/ day/g, '/ দিন').replace(/\/day/g, '/দিন')
    : suffix;

  const display = useTransform(spring, (current) => {
    let rawFormatted;
    if (decimals > 0) {
      rawFormatted = current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      rawFormatted = Math.round(current).toLocaleString();
    }
    const finalNumber = isBangla ? toBengaliDigits(rawFormatted) : rawFormatted;
    return localizedPrefix + finalNumber + localizedSuffix;
  });

  useEffect(() => {
    setMounted(true);
    spring.set(numericValue);
  }, [spring, numericValue]);

  const rawFallback = decimals > 0 ? numericValue.toFixed(decimals) : Math.round(numericValue).toLocaleString();
  const fallbackNumber = isBangla ? toBengaliDigits(rawFallback) : rawFallback;

  return (
    <motion.span className={cn("inline-block tabular-nums", className)}>
      {mounted ? display : (localizedPrefix + fallbackNumber + localizedSuffix)}
    </motion.span>
  );
}
