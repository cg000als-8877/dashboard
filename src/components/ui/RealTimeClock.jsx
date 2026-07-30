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
        <p className="text-white text-[11px] font-medium">{dateStr}</p>
        <span className="text-[var(--color-text-secondary)] text-[10px]">|</span>
        <p className="text-white text-[11px] font-medium">{hijriStr}</p>
        <span className="text-[var(--color-text-secondary)] text-[10px]">|</span>
        <p className="text-white text-[11px] font-medium">{banglaStr}</p>
      </div>

      {/* Desktop View: Interactive Dropdown Tile */}
      <div className="hidden md:flex flex-col w-full relative">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 cursor-pointer group py-1"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></div>
          <p className="text-[var(--color-text-secondary)] group-hover:text-white text-xs font-semibold tracking-wide transition-colors">{dateStr}</p>
          <svg 
            className={`w-3.5 h-3.5 text-[var(--color-text-secondary)] group-hover:text-white transition-transform duration-300 ml-auto ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-black border border-[rgba(255,255,255,0.1)] rounded-lg p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-2.5 origin-top animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-0.5">Hijri</span>
              <p className="text-[var(--color-text-secondary)] text-[11px] font-medium leading-tight">{hijriStr}</p>
            </div>
            <div className="flex flex-col mt-0.5">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Bengali</span>
              <p className="text-[var(--color-text-secondary)] text-[11px] font-medium leading-tight">{banglaStr}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
