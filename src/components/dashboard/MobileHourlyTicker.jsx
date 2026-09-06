"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export function MobileHourlyTicker() {
  const [tickerData, setTickerData] = useState({
    dateFormatted: '06 SEP, 26',
    hourLabel: 'Through 8th Hour',
    items: [
      { line: 'Line A', val: '0' },
      { line: 'Line B', val: '630' },
      { line: 'Line C', val: '2,000' }
    ],
    total: '2,630'
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLatestHourly() {
      try {
        const listRes = await fetch('/api/hourly');
        if (!listRes.ok) return;
        const listJson = await listRes.json();
        const latestDate = listJson.availableDates?.[0];
        if (!latestDate) return;

        const dataRes = await fetch(`/api/hourly?date=${latestDate}`);
        if (!dataRes.ok) return;
        const dataJson = await dataRes.json();

        if (!dataJson.lines || dataJson.lines.length === 0) return;

        let maxHourIndex = 0;
        let grandTotal = 0;
        const lineItems = [];

        dataJson.lines.forEach(line => {
          let lineTotal = 0;
          if (Array.isArray(line.actual)) {
            line.actual.forEach((val, idx) => {
              if (val !== null && val !== undefined) {
                lineTotal += Number(val);
                if (idx > maxHourIndex) maxHourIndex = idx;
              }
            });
          }
          grandTotal += lineTotal;
          lineItems.push({
            line: `Line ${line.line_id.toUpperCase()}`,
            val: Math.round(lineTotal).toLocaleString()
          });
        });

        const timeLabel = dataJson.timeLabels?.[maxHourIndex] || `${maxHourIndex + 1}TH`;
        const hourSuffix = timeLabel.endsWith('ST') ? '1st' :
                           timeLabel.endsWith('ND') ? '2nd' :
                           timeLabel.endsWith('RD') ? '3rd' :
                           timeLabel.toLowerCase();

        let formattedDate = '06 SEP, 26';
        if (dataJson.date) {
          try {
            formattedDate = format(parseISO(dataJson.date), 'dd MMM, yy').toUpperCase();
          } catch (e) {}
        }

        if (isMounted && lineItems.length > 0) {
          setTickerData({
            dateFormatted: formattedDate,
            hourLabel: `Through ${hourSuffix.toUpperCase()} Hour`,
            items: lineItems,
            total: Math.round(grandTotal).toLocaleString()
          });
        }
      } catch (err) {
        // Keep default fallback
      }
    }

    loadLatestHourly();
    return () => { isMounted = false; };
  }, []);

  const renderTickerContent = () => (
    <div className="flex items-center gap-2.5 px-4 shrink-0">
      <span className="font-mono font-bold text-[var(--color-primary)] text-[10px]">
        {tickerData.dateFormatted}
      </span>
      <span className="text-[var(--color-text-muted)] text-[10px] font-semibold">-</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
        Total Output ({tickerData.hourLabel}) —
      </span>

      {tickerData.items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5 text-[10px]">
          <span className="font-bold text-[var(--color-primary)]">{item.line}:</span>
          <span className="font-mono font-bold text-[var(--color-text-main)]">{item.val}</span>
          {idx < tickerData.items.length - 1 && (
            <span className="text-[var(--color-border)] opacity-60 ml-1">/</span>
          )}
        </span>
      ))}

      <span className="text-[var(--color-border)] opacity-60">|</span>
      <span className="flex items-center gap-1 text-[10px]">
        <span className="font-bold uppercase text-[var(--color-text-muted)]">Total:</span>
        <span className="font-mono font-black text-[var(--color-success-text)]">{tickerData.total} PCS</span>
      </span>
      <span className="text-[var(--color-border)] opacity-60 ml-2 mr-2">✦</span>
    </div>
  );

  return (
    <Link 
      href="/hourly"
      className="md:hidden block w-full bg-[var(--color-bg-card)]/95 backdrop-blur-md border-b border-[var(--color-border)] py-1 overflow-hidden relative select-none hover:bg-[var(--color-surface-hover)] transition-colors"
      title="Tap to view hourly production report"
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {renderTickerContent()}
        {renderTickerContent()}
      </div>
    </Link>
  );
}


