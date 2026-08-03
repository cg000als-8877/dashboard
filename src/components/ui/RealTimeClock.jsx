"use client";

import { useState, useEffect } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { parseISO } from 'date-fns';

export function RealTimeClock({ className = "" }) {
  const { dailyTrends } = useKpiData();
  const [time, setTime] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (dailyTrends && dailyTrends.length > 0) {
      const endDate = dailyTrends[dailyTrends.length - 1].date;
      setTime(parseISO(endDate));
    } else {
      setTime(new Date());
    }
  }, [dailyTrends]);

  if (!time) return <div className={`h-[24px] ${className}`}></div>;

  const dateStr = time.toLocaleDateString('en-US', { 
    timeZone: 'Asia/Dhaka',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let hijriStr = new Intl.DateTimeFormat('bn-BD-u-ca-islamic-umalqura', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  }).format(time);
  
  // Replace standard 'যুগ' with 'হিজরি' (Hijri)
  hijriStr = hijriStr.replace('যুগ', 'হিজরি');

  // Bangladesh Bengali Calendar calculation
  const banglaMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  
  let gY = time.getFullYear();
  let bY = gY - 593;
  let leap = isLeapYear(gY);
  
  let start = new Date(gY, 0, 0);
  let diff = (time - start) + ((start.getTimezoneOffset() - time.getTimezoneOffset()) * 60 * 1000);
  let dayOfYear = Math.floor(diff / 86400000);
  let bStart = leap ? 105 : 104;
  
  if (dayOfYear < bStart) bY -= 1;
  
  let daysSinceNewYear;
  if (dayOfYear >= bStart) {
    daysSinceNewYear = dayOfYear - bStart;
  } else {
    let prevYearLeap = isLeapYear(gY - 1);
    daysSinceNewYear = (prevYearLeap ? 366 : 365) - (isLeapYear(gY-1) ? 105 : 104) + dayOfYear;
  }
  
  let mLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, leap ? 30 : 29, 30];
  let bMonth = 0;
  let bDay = daysSinceNewYear + 1;
  for (let i = 0; i < 12; i++) {
    if (bDay > mLengths[i]) {
      bDay -= mLengths[i];
      bMonth++;
    } else {
      break;
    }
  }
  
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const toBnNum = (n) => n.toString().split('').map(d => bnDigits[parseInt(d)]).join('');
  const banglaStr = `${toBnNum(bDay)} ${banglaMonths[bMonth]}, ${toBnNum(bY)} বঙ্গাব্দ`;

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile View: Inline side-by-side */}
      <div className="flex md:hidden flex-row flex-wrap justify-center items-center gap-2 text-center w-full">
        <p className="text-[var(--color-text-main)] text-[11px] font-medium">{dateStr}</p>
        <span className="text-[var(--color-text-secondary)] text-[10px]">|</span>
        <p className="text-[var(--color-text-main)] text-[11px] font-medium">{hijriStr}</p>
        <span className="text-[var(--color-text-secondary)] text-[10px]">|</span>
        <p className="text-[var(--color-text-main)] text-[11px] font-medium">{banglaStr}</p>
      </div>

    </div>
  );
}
