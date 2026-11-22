"use client";

import { useState, useEffect } from 'react';
import { useKpiData } from '@/utils/useKpiData';
import { parseISO } from 'date-fns';

export function RealTimeClock({ className = "" }) {
  const { dailyTrends } = useKpiData();
  const [time, setTime] = useState(null);

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

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-center items-center gap-2 text-center w-full">
        <p className="text-[var(--color-text-main)] text-[11px] font-light">{dateStr}</p>
      </div>
    </div>
  );
}
