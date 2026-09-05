"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Clock, Calendar as CalendarIcon, RefreshCw, AlertTriangle, Sparkles, TrendingUp, Activity, ChevronLeft, ChevronRight, ChevronDown, Calendar, Flag, ShieldCheck } from 'lucide-react';
import { cn } from '@/components/layout/Sidebar';

import { format, parseISO } from 'date-fns';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { HourlySkeleton } from '@/components/ui/Skeletons';
import { getHolidayInfo } from '@/utils/holidays';

// In-memory cache for instant page switching
const hourlyCache = {
  dates: null,
  data: {},
  dateTotals: {}
};

const LINE_META = {
  'A': {
    color: '#10B981', // Emerald
    glow: 'rgba(16, 185, 129, 0.25)',
    onColor: '#FFFFFF'
  },
  'B': {
    color: '#3B82F6', // Blue
    glow: 'rgba(59, 130, 246, 0.25)',
    onColor: '#FFFFFF'
  },
  'C': {
    color: '#A855F7', // Purple
    glow: 'rgba(168, 85, 247, 0.25)',
    onColor: '#FFFFFF'
  },
  'D': {
    color: '#F59E0B', // Amber
    glow: 'rgba(245, 158, 11, 0.25)',
    onColor: '#FFFFFF'
  }
};

function PrecisionProgressRing({ percentage, customColor, customGlow }) {
  // ── Geometry ─────────────────────────────────────────────
  const cx = 50; const cy = 50;
  const rOuter = 45;   // outer decorative orbit ring
  const rMain  = 38;   // main progress arc
  const circMain  = 2 * Math.PI * rMain;

  // 270-degree sweep, starts at 135°
  const sweepDeg = 270;
  const startDeg = 135;
  const arcMain  = (sweepDeg / 360) * circMain;
  const bigGap   = circMain;

  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  // Dynamic Theme Colors based on Achievement Tier
  let strokeGradStart = '#F43F5E';
  let strokeGradEnd   = '#FB923C';
  let glowColor       = 'rgba(244, 63, 94, 0.35)';

  if (customColor) {
    strokeGradStart = customColor;
    strokeGradEnd = customColor;
    glowColor = customGlow || 'rgba(96, 165, 250, 0.35)';
  } else if (clampedPct >= 95) {
    strokeGradStart = '#10B981';
    strokeGradEnd   = '#34D399';
    glowColor       = 'rgba(16, 185, 129, 0.4)';
  } else if (clampedPct >= 75) {
    strokeGradStart = '#06B6D4';
    strokeGradEnd   = '#38BDF8';
    glowColor       = 'rgba(6, 182, 212, 0.35)';
  } else if (clampedPct >= 45) {
    strokeGradStart = '#F59E0B';
    strokeGradEnd   = '#FBBF24';
    glowColor       = 'rgba(245, 158, 11, 0.35)';
  }

  const toOffset = arcMain * (1 - clampedPct / 100);
  const [mainOffset, setMainOffset] = useState(toOffset);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    setCanAnimate(false);
    setMainOffset(arcMain);

    const t1 = setTimeout(() => setCanAnimate(true), 30);
    const t2 = setTimeout(() => {
      setMainOffset(arcMain * (1 - clampedPct / 100));
    }, 80);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [clampedPct, arcMain]);

  const easing = 'cubic-bezier(0.34, 1.15, 0.64, 1)';
  const transition = canAnimate ? `stroke-dashoffset 1.2s ${easing}` : 'none';

  // Tip-dot coordinates
  const tipDeg = startDeg + (clampedPct / 100) * sweepDeg;
  const tipRad = (tipDeg * Math.PI) / 180;
  const tipX   = cx + rMain * Math.cos(tipRad);
  const tipY   = cy + rMain * Math.sin(tipRad);
  const tipTransform = `translate(${tipX - cx} ${tipY - cy})`;

  const gradId = `pgGrad-${Math.round(clampedPct)}-${customColor ? 'custom' : 'tier'}`;
  const glowId = `pgGlow-${Math.round(clampedPct)}`;

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeGradStart} />
            <stop offset="100%" stopColor={strokeGradEnd} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer decorative halo orbit */}
        <circle
          cx={cx} cy={cy} r={rOuter}
          fill="none"
          stroke={strokeGradStart}
          strokeWidth="0.5"
          strokeDasharray="2 4"
          opacity="0.25"
        />

        {/* Ghost background track */}
        <circle
          cx={cx} cy={cy} r={rMain}
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray={`${arcMain} ${bigGap}`}
          transform={`rotate(${startDeg} ${cx} ${cy})`}
        />

        {/* Main glowing progress arc */}
        <circle
          cx={cx} cy={cy} r={rMain}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray={`${arcMain} ${bigGap}`}
          style={{ 
            strokeDashoffset: mainOffset, 
            transition,
            filter: `drop-shadow(0 0 6px ${glowColor})` 
          }}
          transform={`rotate(${startDeg} ${cx} ${cy})`}
        />

        {/* Tip glowing beacon */}
        {clampedPct > 0 && (
          <g
            transform={tipTransform}
            style={{
              transition: canAnimate ? `transform 1.2s ${easing}` : 'none',
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            <circle cx={cx} cy={cy} r="4.5" fill={strokeGradEnd} opacity="0.3" filter={`url(#${glowId})`} />
            <circle cx={cx} cy={cy} r="2.2" fill="#FFFFFF" filter={`url(#${glowId})`} />
          </g>
        )}

        {/* Boundary tick markers */}
        {[startDeg, startDeg + sweepDeg].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line key={deg}
              x1={cx + (rMain - 4) * Math.cos(r)} y1={cy + (rMain - 4) * Math.sin(r)}
              x2={cx + (rMain + 4) * Math.cos(r)} y2={cy + (rMain + 4) * Math.sin(r)}
              stroke="var(--color-text-muted)" strokeWidth="1" opacity="0.35"
            />
          );
        })}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex items-baseline gap-[1px]">
          <AnimatedNumber
            value={clampedPct}
            className="text-[19px] sm:text-[22px] font-black tracking-tighter leading-none"
            style={{ color: strokeGradEnd }}
          />
          <span className="text-[9px] sm:text-[10px] font-black leading-none mb-[1px]" style={{ color: strokeGradEnd }}>%</span>
        </div>
        <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mt-[2px]">
          ACH
        </span>
      </div>
    </div>
  );
}

export default function HourlyPage() {
  const dateInputRef = useRef(null);
  const [availableDates, setAvailableDates] = useState(hourlyCache.dates || []);
  const [dateTotals, setDateTotals] = useState(hourlyCache.dateTotals || {});
  const [selectedDate, setSelectedDate] = useState(hourlyCache.dates ? hourlyCache.dates[0] : '');
  const [data, setData] = useState(selectedDate && hourlyCache.data[selectedDate] ? hourlyCache.data[selectedDate] : null);
  const [loading, setLoading] = useState(!data);
  const [mobileTab, setMobileTab] = useState('OVERALL'); // 'OVERALL' | 'A' | 'B' | 'C' | 'D'
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const holidayInfo = getHolidayInfo(selectedDate);

  // Helper to format date "YYYY-MM-DD" to "d MMM, yyyy"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'd MMM, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  useEffect(() => {
    let isMounted = true;

    async function initHourly() {
      if (hourlyCache.dates && hourlyCache.dates.length > 0) {
        if (isMounted) {
          setAvailableDates(hourlyCache.dates);
          if (hourlyCache.dateTotals) {
            setDateTotals(hourlyCache.dateTotals);
          }
          const latest = hourlyCache.dates[0];
          setSelectedDate(latest);
          if (hourlyCache.data[latest]) {
            setData(hourlyCache.data[latest]);
            setLoading(false);
          }
        }
      }

      try {
        const res = await fetch(`/api/hourly`);
        if (!res.ok) throw new Error('Failed to fetch hourly index');
        const json = await res.json();
        
        if (isMounted && json.availableDates && json.availableDates.length > 0) {
          hourlyCache.dates = json.availableDates;
          setAvailableDates(json.availableDates);
          if (json.dateTotals) {
            hourlyCache.dateTotals = json.dateTotals;
            setDateTotals(json.dateTotals);
          }
          if (!selectedDate) {
            setSelectedDate(json.availableDates[0]);
          }
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    }

    initHourly();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    if (hourlyCache.data[selectedDate]) {
      setData(hourlyCache.data[selectedDate]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isMounted = true;

    fetch(`/api/hourly?date=${selectedDate}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          hourlyCache.data[selectedDate] = json;
          setData(json);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  if (loading && !data) {
    return <HourlySkeleton />;
  }

  const isDataEmpty = !data || !data.lines || data.lines.length === 0 || (
    data.lines.every(l => !l.actual || l.actual.every(a => a === 0)) &&
    data.lines.every(l => !l.target || l.target.every(t => t === 0))
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-[fade-up_0.4s_ease-out_both] w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-[20px] sm:text-[24px] md:text-5xl font-bold tracking-normal [letter-spacing:0] uppercase mb-1 md:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
              {/* Mobile view: LIVE PRODUCTION */}
              <span className="md:hidden">
                LIVE PRODUCTION{selectedDate ? ` ${format(parseISO(selectedDate), 'dd MMM, yy')}` : ''}
              </span>

              {/* Desktop view: Hourly Tracking */}
              <span className="hidden md:inline-flex items-center gap-3">
                <span>Hourly Tracking</span>
                {selectedDate && <span className="opacity-80 font-semibold">- {format(parseISO(selectedDate), 'dd MMM, yy')}</span>}
              </span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-[10px] md:text-base tracking-wide font-medium flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
              <Clock className="hidden md:block md:w-4 md:h-4 text-[var(--color-primary)]" />
              Intraday production breakdown
            </p>
          </div>
          
          <div className="relative group w-full md:w-auto z-30 flex flex-col md:flex-row items-center gap-2">
            {/* Custom Date Picker Button & Input */}
            <div 
              onClick={() => setIsDatePickerModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-main)] py-2.5 md:py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all duration-200 hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 font-semibold cursor-pointer shadow-sm active:scale-[0.98] relative overflow-hidden"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <span className="truncate text-xs md:text-sm font-semibold">
                  {selectedDate 
                    ? selectedDate === availableDates[0] ? `Today (${formatDate(selectedDate)})` : formatDate(selectedDate)
                    : 'Select Date'}
                </span>
                {holidayInfo && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {holidayInfo.icon} {holidayInfo.isFriday ? 'Friday' : 'Holiday'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2.5 py-1 rounded-lg shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Pick Date
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Date Modal & Color Coded List */}
        {mounted && typeof window !== 'undefined' && isDatePickerModalOpen && createPortal(
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scale-up_0.25s_ease-out]">
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="font-bold text-base text-[var(--color-text-main)] uppercase tracking-wider">Select Production Date</h3>
                </div>
                <button 
                  onClick={() => setIsDatePickerModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Native Calendar Trigger Header */}
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-between">
                <div className="text-xs text-[var(--color-text-secondary)] font-medium">
                  Use Device Calendar or Select from Below:
                </div>
                <div className="relative">
                  <button 
                    onClick={() => {
                      if (dateInputRef.current) {
                        try { dateInputRef.current.showPicker(); } catch (e) { dateInputRef.current.focus(); }
                      }
                    }}
                    className="px-3 py-1.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Open Calendar
                  </button>
                  <input 
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate || ''}
                    min={availableDates.length > 0 ? availableDates[availableDates.length - 1] : ''}
                    max={availableDates.length > 0 ? availableDates[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setIsDatePickerModalOpen(false);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Coded Date List */}
              <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1 hide-scrollbar">
                {availableDates.map((date) => {
                  const hInfo = getHolidayInfo(date);
                  const isSelected = selectedDate === date;
                  const isToday = date === availableDates[0];

                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setIsDatePickerModalOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all font-medium border text-xs md:text-sm",
                        isSelected 
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40 shadow-sm"
                          : hInfo
                            ? hInfo.isFriday 
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20" 
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-[var(--color-surface)]/40 text-[var(--color-text-main)] border-transparent hover:bg-[var(--color-surface)]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm md:text-base">{hInfo ? hInfo.icon : (isToday ? '⭐️' : '📅')}</span>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-semibold leading-tight">
                            {isToday ? `Today (${formatDate(date)})` : formatDate(date)}
                          </span>
                          {hInfo && (
                            <span className="text-[9px] opacity-80 font-medium leading-none mt-0.5">
                              {hInfo.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {hInfo ? (
                        <span className={cn(
                          "text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ml-2",
                          hInfo.isFriday 
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        )}>
                          {hInfo.isFriday ? 'Friday Rest' : 'Public Holiday'}
                        </span>
                      ) : (
                        <span className="text-[10px] md:text-xs font-bold font-mono tracking-wide shrink-0 ml-2 text-[var(--color-primary)]">
                          TOTAL : {dateTotals[date] !== undefined ? dateTotals[date] : '—'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Holiday / Empty State Handler */}
        {isDataEmpty ? (
          holidayInfo ? (
            <Card className="p-8 md:p-14 border-2 border-amber-500/30 bg-gradient-to-br from-[var(--color-bg-card)] via-[var(--color-surface)] to-amber-950/20 shadow-2xl rounded-3xl relative overflow-hidden text-center my-6">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-amber-500/10 animate-bounce">
                  {holidayInfo.icon}
                </div>
                
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3">
                  {holidayInfo.isFriday ? "Weekly Factory Holiday" : "Official Public Holiday"}
                </span>

                <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text-main)] mb-1">
                  {holidayInfo.title}
                </h3>
                
                <p className="text-xs md:text-sm font-semibold text-amber-400/90 mb-4 uppercase tracking-wider">
                  {holidayInfo.subtitle} • {formatDate(selectedDate)}
                </p>

                <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed shadow-inner mb-4">
                  {holidayInfo.description}
                </div>

                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Factory Operations Closed • Resuming Next Working Day
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">No Hourly Data Available</h3>
              <p className="text-[var(--color-text-secondary)]">We couldn't find hourly records for {selectedDate}.</p>
            </Card>
          )
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Compute Global Factory Totals */}
            {(() => {
              const factoryTargetHourly = Array(data.timeLabels.length).fill(0);
              const factoryActualHourly = Array(data.timeLabels.length).fill(0);
              let factoryTotalTarget = 0;
              let factoryTotalActual = 0;
              
              data.lines.forEach(line => {
                line.target.forEach((t, i) => {
                   factoryTargetHourly[i] += (t || 0);
                   factoryTotalTarget += (t || 0);
                });
                line.actual.forEach((a, i) => {
                   factoryActualHourly[i] += (a || 0);
                   factoryTotalActual += (a || 0);
                });
              });
              
              const factoryAchievement = factoryTotalTarget > 0 ? Math.round((factoryTotalActual / factoryTotalTarget) * 100) : 0;

              // Active Hour Text for summary
              let activeHourText = '';
              if (data.lines && data.lines.length > 0) {
                for (let h = 10; h >= 0; h--) {
                  const hasData = data.lines.some(l => l.actual && l.actual[h] !== null && l.actual[h] !== undefined);
                  if (hasData) {
                    const rawLabel = (data.timeLabels && data.timeLabels[h]) || `${h + 1}TH`;
                    const formatted = rawLabel.replace(/^(\d+)(ST|ND|RD|TH|st|nd|rd|th)?/i, (_, num, sfx) => {
                      const s = (sfx || 'th').toLowerCase();
                      return `${num}${s}`;
                    });
                    activeHourText = `${formatted} Hour`;
                    break;
                  }
                }
              }

              const sortedLines = data.lines
                ? data.lines.slice().sort((a, b) => a.line_id.localeCompare(b.line_id))
                : [];

              return (
                <>
                  {/* ── TOTAL FACTORY PRODUCTION CARD CONTAINER ── */}
                  <div className="w-full">
                    <Card className="p-0 overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-md rounded-2xl">
                      {/* Header Container */}
                      <div className="p-4 md:p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left w-full md:w-auto">
                          <h2 className="text-lg md:text-3xl font-bold tracking-tight text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary-glow)]">
                            TOTAL PRODUCTION
                          </h2>
                          <p className="text-[10px] md:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
                            SUMMARY OF ALL PRODUCTION LINES COMBINED
                          </p>
                        </div>

                        {/* Desktop KPI Summary Boxes */}
                        <div className="hidden md:flex bg-[var(--color-surface)]/60 rounded-xl p-2.5 shadow-sm border border-[var(--color-border)] w-auto">
                          <div className="text-center border-r border-[var(--color-border)] px-5">
                            <p className="text-[9.5px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-0.5 whitespace-nowrap">
                              Total Target
                            </p>
                            <p className="text-base font-bold text-[var(--color-text-main)]"><AnimatedNumber value={factoryTotalTarget} /></p>
                          </div>
                          <div className="text-center border-r border-[var(--color-border)] px-5">
                            <p className="text-[9.5px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-0.5 whitespace-nowrap">
                              Total Actual
                            </p>
                            <p className="text-base font-bold text-[var(--color-primary)]"><AnimatedNumber value={factoryTotalActual} /></p>
                          </div>
                          <div className="text-center px-5">
                            <p className="text-[9.5px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-0.5 whitespace-nowrap">
                              Achievement
                            </p>
                            <p className={cn(
                              "text-lg font-black",
                              (factoryAchievement >= 100) ? "text-[var(--color-success-text)]" : "text-amber-500"
                            )}>
                              <AnimatedNumber value={factoryAchievement} suffix="%" />
                            </p>
                          </div>
                        </div>

                        {/* Mobile Overview Card */}
                        <div className="flex md:hidden flex-col w-full bg-[var(--color-surface)]/40 rounded-2xl p-3.5 sm:p-4 border border-[var(--color-border)] gap-3 shadow-inner">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-2.5">
                              {/* Target */}
                              <div className="flex flex-col">
                                <span className="text-[9.5px] uppercase tracking-widest text-[var(--color-text-secondary)] font-bold">
                                  TARGET
                                </span>
                                <span className="text-xl font-black text-[var(--color-text-main)] leading-none mt-0.5">
                                  <AnimatedNumber value={factoryTotalTarget} />
                                </span>
                              </div>
                              {/* Actual */}
                              <div className="flex flex-col">
                                <span className="text-[9.5px] uppercase tracking-widest text-[var(--color-text-secondary)] font-bold">
                                  ACTUAL
                                </span>
                                <span className="text-xl font-black text-[var(--color-primary)] leading-none mt-0.5">
                                  <AnimatedNumber value={factoryTotalActual} />
                                </span>
                              </div>
                            </div>

                            {/* Upgraded Modern Precision Achievement Gauge */}
                            <PrecisionProgressRing percentage={factoryAchievement} />
                          </div>

                          {/* Line Production Totals Row */}
                          <div className="pt-2.5 border-t border-[var(--color-border)]/60 text-[11px] sm:text-[12px] text-center text-[var(--color-text-muted)] italic font-bold tracking-wide leading-relaxed">
                            <span>Total Output </span>
                            {activeHourText && (
                              <span className="text-[var(--color-primary)] font-extrabold not-italic">
                                (Through {activeHourText})
                              </span>
                            )}
                            <span> — </span>
                            {sortedLines.map((line, idx) => {
                              const lineActualTotal = line.actual ? line.actual.reduce((sum, val) => sum + (val || 0), 0) : 0;
                              const meta = LINE_META[line.line_id.toUpperCase()] || { color: 'var(--color-primary)' };
                              return (
                                <span key={line.line_id} className="inline-flex items-baseline">
                                  <span style={{ color: meta.color }} className="font-extrabold not-italic">
                                    Line {line.line_id}:
                                  </span>
                                  <span className="text-[var(--color-text-main)] font-extrabold ml-1 not-italic">
                                    {lineActualTotal.toLocaleString()}
                                  </span>
                                  {idx < sortedLines.length - 1 && (
                                    <span className="text-[var(--color-text-muted)]/70 mx-1.5 not-italic font-normal">
                                      •
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>

                          {/* ── ATTACHED MOBILE TAB BAR DIRECTLY UNDER TOTAL OUTPUT LINE ── */}
                          <div className="flex items-center justify-between p-1 gap-1 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-sm mt-0.5">
                            <button
                              onClick={() => setMobileTab('OVERALL')}
                              className={cn(
                                "flex-1 py-1.5 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 relative border flex items-center justify-center gap-1 active:scale-95",
                                mobileTab === 'OVERALL'
                                  ? "border-transparent bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm font-black"
                                  : "border-transparent bg-transparent text-[var(--color-text-secondary)] font-bold hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]"
                              )}
                            >
                              OVERALL
                            </button>
                            {sortedLines.map((l) => {
                              const isTabActive = mobileTab === l.line_id;
                              const lMeta = LINE_META[l.line_id.toUpperCase()] || LINE_META['A'];
                              
                              return (
                                <button
                                  key={`card-inner-tab-${l.line_id}`}
                                  onClick={() => setMobileTab(l.line_id)}
                                  className={cn(
                                    "flex-1 py-1.5 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 relative border flex items-center justify-center gap-1 active:scale-95",
                                    isTabActive
                                      ? "border-transparent text-white shadow-sm font-black"
                                      : "border-transparent bg-transparent text-[var(--color-text-secondary)] font-bold hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]"
                                  )}
                                  style={isTabActive ? { 
                                    backgroundColor: lMeta.color,
                                    boxShadow: `0 2px 8px ${lMeta.glow}`,
                                    color: lMeta.onColor
                                  } : {}}
                                >
                                  LINE {l.line_id}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto w-full hide-scrollbar">
                        <table className="w-full text-left border-collapse table-auto min-w-[800px]">
                          <thead>
                            <tr className="bg-[var(--color-bg-card)]">
                              <th className="px-4 py-3.5 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-bold border-b border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-bg-card)] z-10 w-32">
                                Summary
                              </th>
                              {data.timeLabels.map((time, idx) => (
                              <th key={idx} className="px-3 py-3.5 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold text-center border-b border-r border-[var(--color-border)] last:border-r-0">
                                {time}
                              </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors group">
                              <td className="px-4 py-3.5 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors border-r border-[var(--color-border)] sticky left-0 z-10">
                                Target
                              </td>
                              {data.timeLabels.map((_, idx) => (
                                <td key={`target-${idx}`} className="px-3 py-3.5 text-sm font-semibold text-center text-[var(--color-text-secondary)] border-r border-[var(--color-border)] last:border-r-0 opacity-80">
                                  {factoryTargetHourly[idx] || 0}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors group">
                              <td className="px-4 py-3.5 text-sm font-bold text-[var(--color-primary)] border-r border-[var(--color-border)] sticky left-0 z-10 bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors">
                                Actual
                              </td>
                              {data.timeLabels.map((_, idx) => {
                                const act = factoryActualHourly[idx] || 0;
                                const tgt = factoryTargetHourly[idx] || 0;
                                const isGood = act >= tgt && tgt > 0;
                                const isZero = act === 0 && tgt === 0;
                                
                                return (
                                  <td key={`actual-${idx}`} className={cn(
                                    "px-3 py-3.5 text-base text-center border-r border-[var(--color-border)] last:border-r-0 font-extrabold",
                                    isZero ? "text-[var(--color-text-muted)]" : isGood ? "text-[var(--color-success-text)] drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                  )}>
                                    {act}
                                  </td>
                                );
                              })}
                            </tr>
                            <tr className="hover:bg-[var(--color-surface)]/50 transition-colors group">
                              <td className="px-4 py-3.5 text-xs font-bold text-[var(--color-text-secondary)] border-r border-[var(--color-border)] sticky left-0 z-10 bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors whitespace-nowrap">
                                Achievement (%)
                              </td>
                              {data.timeLabels.map((_, idx) => {
                                const act = factoryActualHourly[idx] || 0;
                                const tgt = factoryTargetHourly[idx] || 0;
                                let percent = 0;
                                if (tgt > 0) percent = Math.round((act / tgt) * 100);
                                
                                const isGood = percent >= 100;
                                const isZero = act === 0 && tgt === 0;
                                
                                return (
                                  <td key={`achieve-${idx}`} className={cn(
                                    "px-3 py-3.5 text-base text-center border-r border-[var(--color-border)] last:border-r-0 font-bold bg-[var(--color-bg-card)]/30",
                                    isZero ? "text-[var(--color-text-muted)] opacity-50" : isGood ? "text-blue-500 dark:text-blue-400" : "text-rose-500 dark:text-rose-400"
                                  )}>
                                    {isZero ? '-' : `${percent}%`}
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* ── MOBILE CARD BODY (Switches based on mobileTab) ── */}
                      <div className="block md:hidden w-full border-t border-[var(--color-border)]">
                        {mobileTab === 'OVERALL' ? (
                          /* Overall Factory 11-Hour Table */
                          <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-center border-collapse table-fixed min-w-[280px]">
                              <thead>
                                <tr className="bg-[var(--color-bg-card)]">
                                  <th className="px-2 py-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                    Hour
                                  </th>
                                  <th className="px-2 py-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                    Target
                                  </th>
                                  <th className="px-2 py-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                    Actual
                                  </th>
                                  <th className="px-2 py-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                    Achieve
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.timeLabels.map((time, timeIdx) => {
                                  const tgt = factoryTargetHourly[timeIdx] || 0;
                                  const act = factoryActualHourly[timeIdx] || 0;
                                  let percent = 0;
                                  if (tgt > 0) {
                                    percent = Math.round((act / tgt) * 100);
                                  }
                                  const isGoodAchieve = percent >= 100;
                                  const isGoodAct = act >= tgt && tgt > 0;
                                  const isZero = tgt === 0 && act === 0;

                                  return (
                                    <tr key={`factory-row-${timeIdx}`} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/50 transition-colors">
                                      <td className="px-2 py-2.5 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-surface)]/30 border-r border-[var(--color-border)]">
                                        {time}
                                      </td>
                                      <td className="px-2 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] border-r border-[var(--color-border)] opacity-80">
                                        {tgt}
                                      </td>
                                      <td className={cn(
                                        "px-2 py-2.5 text-sm font-bold border-r border-[var(--color-border)]",
                                        isZero ? "text-[var(--color-text-muted)]" : isGoodAct ? "text-[var(--color-success-text)]" : "text-amber-500"
                                      )}>
                                        {act}
                                      </td>
                                      <td className={cn(
                                        "px-2 py-2.5 text-sm font-bold bg-[var(--color-bg-card)]/30",
                                        isZero ? "text-[var(--color-text-muted)] opacity-50" : isGoodAchieve ? "text-blue-500 dark:text-blue-400" : "text-rose-500 dark:text-rose-400"
                                      )}>
                                        {isZero ? '-' : `${percent}%`}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* Selected Line Specs & Hourly Table on Mobile */
                          (() => {
                            const selectedLine = sortedLines.find(l => l.line_id === mobileTab);
                            if (!selectedLine) return null;

                            const meta = LINE_META[selectedLine.line_id.toUpperCase()] || LINE_META['A'];
                            const lineTotalTarget = selectedLine.target.reduce((a, b) => a + (b || 0), 0);
                            const lineTotalActual = selectedLine.actual.reduce((a, b) => a + (b || 0), 0);
                            const lineAchievement = lineTotalTarget > 0 ? Math.round((lineTotalActual / lineTotalTarget) * 100) : 0;

                            return (
                              <div className="flex flex-col animate-[fade-in_0.2s_ease-out]">
                                {/* Line Sub-Header / Specs Grid */}
                                <div className="p-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/20">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {/* Buyer */}
                                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                      <div className="w-1 h-full min-h-[22px] rounded-full bg-emerald-500 flex-shrink-0"></div>
                                      <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                        <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                          Buyer
                                        </span>
                                        <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{selectedLine.buyer || 'N/A'}</span>
                                      </div>
                                    </div>
                                    {/* Style */}
                                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                      <div className="w-1 h-full min-h-[22px] rounded-full bg-blue-500 flex-shrink-0"></div>
                                      <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                        <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                          Style
                                        </span>
                                        <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{selectedLine.style || 'N/A'}</span>
                                      </div>
                                    </div>
                                    {/* Item */}
                                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                      <div className="w-1 h-full min-h-[22px] rounded-full bg-purple-500 flex-shrink-0"></div>
                                      <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                        <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                          Item
                                        </span>
                                        <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{selectedLine.item || 'N/A'}</span>
                                      </div>
                                    </div>
                                    {/* Workers */}
                                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                      <div className="w-1 h-full min-h-[22px] rounded-full bg-amber-500 flex-shrink-0"></div>
                                      <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                        <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                          Workers
                                        </span>
                                        <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{selectedLine.mp || '0'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Line Hourly Table */}
                                <div className="overflow-x-auto w-full hide-scrollbar">
                                  <table className="w-full text-center border-collapse table-fixed min-w-[200px]">
                                    <thead>
                                      <tr className="bg-[var(--color-bg-card)]">
                                        <th className="px-1 py-2 text-[8.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                          Hour
                                        </th>
                                        <th className="px-1 py-2 text-[8.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                          Target
                                        </th>
                                        <th className="px-1 py-2 text-[8.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                          Actual
                                        </th>
                                        <th className="px-1 py-2 text-[8.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4 truncate">
                                          Achieve
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.timeLabels.map((time, timeIdx) => {
                                        const rawTgt = selectedLine.target[timeIdx];
                                        const rawAct = selectedLine.actual[timeIdx];
                                        const hasTarget = rawTgt !== null && rawTgt !== undefined;
                                        const hasActual = rawAct !== null && rawAct !== undefined;
                                        
                                        const tgt = hasTarget ? Number(rawTgt) : 0;
                                        const act = hasActual ? Number(rawAct) : 0;
                                        
                                        let percent = 0;
                                        if (tgt > 0) {
                                          percent = Math.round((act / tgt) * 100);
                                        }
                                        const isGoodAchieve = percent >= 100;
                                        const isGoodAct = act >= tgt && tgt > 0;
                                        const isZero = tgt === 0 && act === 0;

                                        const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
                                        const serialTime = ordinals[timeIdx] || time;

                                        return (
                                          <tr key={`mobile-line-row-${timeIdx}`} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/50 transition-colors">
                                            <td className="px-2 py-2 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-surface)]/30 border-r border-[var(--color-border)]">
                                              {serialTime}
                                            </td>
                                            <td className="px-2 py-2 text-xs font-semibold text-[var(--color-text-secondary)] border-r border-[var(--color-border)] opacity-80">
                                              {hasActual ? tgt : '-'}
                                            </td>
                                            <td className={cn(
                                              "px-2 py-1.5 text-sm font-bold border-r border-[var(--color-border)]",
                                              !hasActual ? "text-[var(--color-text-muted)] opacity-50" : isZero ? "text-[var(--color-text-muted)]" : isGoodAct ? "text-[var(--color-success-text)]" : "text-amber-500"
                                            )}>
                                              {!hasActual ? (
                                                '-'
                                              ) : (
                                                <div className="flex flex-col items-center justify-center">
                                                  <span>{act}</span>
                                                  {selectedLine.notes && selectedLine.notes[timeIdx] && (
                                                    <span 
                                                      className="text-[8px] font-normal text-white whitespace-nowrap leading-tight mt-0.5 block max-w-full truncate"
                                                      title={selectedLine.notes[timeIdx]}
                                                    >
                                                      {selectedLine.notes[timeIdx]}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                            <td className={cn(
                                              "px-2 py-2 text-sm font-bold bg-[var(--color-bg-card)]/30",
                                              !hasActual ? "text-[var(--color-text-muted)] opacity-50" : isZero ? "text-[var(--color-text-muted)] opacity-50" : isGoodAchieve ? "text-blue-500 dark:text-blue-400" : "text-rose-500 dark:text-rose-400"
                                            )}>
                                              {!hasActual ? '-' : isZero ? '-' : `${percent}%`}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Line Total Summary Footer */}
                                <div className="bg-[var(--color-surface)]/30 p-3 border-t border-[var(--color-border)] flex items-center justify-between">
                                  <div>
                                    <p className="text-[8.5px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest leading-tight">
                                      Achievement
                                    </p>
                                    <p className="text-sm font-black text-[var(--color-text-main)]">
                                      {lineAchievement}%
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[8.5px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest leading-tight">
                                      Total Actual
                                    </p>
                                    <p 
                                      className="text-xl font-black leading-none transition-all duration-300"
                                      style={{
                                        color: meta.color,
                                        textShadow: `0 0 10px ${meta.glow}`
                                      }}
                                    >
                                      <AnimatedNumber value={lineTotalActual} />
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* ── DESKTOP LINE LEVEL TELEMETRY CARDS (4-Column Grid on Desktop Only) ── */}
                  <div className="hidden md:block w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6">
                      {sortedLines.map((line) => {
                        const meta = LINE_META[line.line_id.toUpperCase()] || LINE_META['A'];
                        const lineTotalTarget = line.target.reduce((a, b) => a + (b || 0), 0);
                        const lineTotalActual = line.actual.reduce((a, b) => a + (b || 0), 0);
                        const lineAchievement = lineTotalTarget > 0 ? Math.round((lineTotalActual / lineTotalTarget) * 100) : 0;

                        return (
                          <div key={line.line_id} className="h-full">
                            <Card 
                              className="p-0 overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-300 relative rounded-2xl border border-[var(--color-border)]"
                              style={{
                                borderTop: `3.5px solid ${meta.color}`,
                                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.12), 0 0 12px ${meta.glow}`
                              }}
                            >
                              {/* Line Header */}
                              <div className="bg-[var(--color-surface)]/50 border-b border-[var(--color-border)] shrink-0 p-3 flex items-center justify-between md:justify-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <div 
                                    className="text-white px-3 py-1 rounded-full text-xs font-black tracking-wider border shadow-[0_2px_10px_var(--line-glow)] md:shadow-none"
                                    style={{
                                      backgroundColor: meta.color,
                                      borderColor: `${meta.color}50`,
                                      '--line-glow': meta.glow
                                    }}
                                  >
                                    LINE {line.line_id}
                                  </div>
                                  <span className="text-xs font-bold text-[var(--color-text-main)] truncate max-w-[150px] md:max-w-[200px]">
                                    {line.item || 'Active Style'}
                                  </span>
                                </div>

                                {/* Target / Act - Shown on mobile, hidden on desktop */}
                                <div className="text-right md:hidden">
                                  <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-extrabold block">
                                    Target / Act
                                  </span>
                                  <span className="text-xs font-black text-[var(--color-text-main)]">
                                    {lineTotalActual.toLocaleString()} / <span className="text-[var(--color-text-secondary)]">{lineTotalTarget.toLocaleString()}</span>
                                  </span>
                                </div>
                              </div>
                              
                              {/* Style & Specs Grid */}
                              <div className="p-2 md:p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/20">
                                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                                  {/* Buyer */}
                                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1 h-full min-h-[22px] rounded-full bg-emerald-500 flex-shrink-0"></div>
                                    <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                      <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                        Buyer
                                      </span>
                                      <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{line.buyer || 'N/A'}</span>
                                    </div>
                                  </div>
                                  {/* Style */}
                                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1 h-full min-h-[22px] rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                      <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                        Style
                                      </span>
                                      <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{line.style || 'N/A'}</span>
                                    </div>
                                  </div>
                                  {/* Item */}
                                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1 h-full min-h-[22px] rounded-full bg-purple-500 flex-shrink-0"></div>
                                    <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                      <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                        Item
                                      </span>
                                      <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{line.item || 'N/A'}</span>
                                    </div>
                                  </div>
                                  {/* MP */}
                                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1 h-full min-h-[22px] rounded-full bg-amber-500 flex-shrink-0"></div>
                                    <div className="flex flex-col w-full min-w-0 overflow-hidden">
                                      <span className="text-[8.5px] uppercase text-[var(--color-text-muted)] font-bold leading-tight">
                                        Workers
                                      </span>
                                      <span className="text-[10.5px] font-bold text-[var(--color-text-main)] truncate">{line.mp || '0'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Hourly Table */}
                              <div className="overflow-x-auto w-full flex-grow hide-scrollbar">
                                <table className="w-full text-center border-collapse table-fixed min-w-[200px]">
                                  <thead>
                                    <tr className="bg-[var(--color-bg-card)]">
                                      <th className="px-1 py-2 text-[8.5px] md:text-[9.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                        Hour
                                      </th>
                                      <th className="px-1 py-2 text-[8.5px] md:text-[9.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                        Target
                                      </th>
                                      <th className="px-1 py-2 text-[8.5px] md:text-[9.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                        Actual
                                      </th>
                                      <th className="px-1 py-2 text-[8.5px] md:text-[9.5px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4 truncate">
                                        Achieve
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.timeLabels.map((time, timeIdx) => {
                                      const rawTgt = line.target[timeIdx];
                                      const rawAct = line.actual[timeIdx];
                                      const hasTarget = rawTgt !== null && rawTgt !== undefined;
                                      const hasActual = rawAct !== null && rawAct !== undefined;
                                      
                                      const tgt = hasTarget ? Number(rawTgt) : 0;
                                      const act = hasActual ? Number(rawAct) : 0;
                                      
                                      let percent = 0;
                                      if (tgt > 0) percent = Math.round((act / tgt) * 100);
                                      const isGoodAchieve = percent >= 100;
                                      const isGoodAct = act >= tgt && tgt > 0;
                                      const isZero = tgt === 0 && act === 0;

                                      const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
                                      const serialTime = ordinals[timeIdx] || time;

                                      return (
                                        <tr key={`line-row-${timeIdx}`} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/50 transition-colors">
                                          <td className="px-2 py-2 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-surface)]/30 border-r border-[var(--color-border)]">
                                            {serialTime}
                                          </td>
                                          <td className="px-2 py-2 text-xs font-semibold text-[var(--color-text-secondary)] border-r border-[var(--color-border)] opacity-80">
                                            {hasActual ? tgt : '-'}
                                          </td>
                                          <td className={cn(
                                            "px-2 py-1.5 text-sm font-bold border-r border-[var(--color-border)]",
                                            !hasActual ? "text-[var(--color-text-muted)] opacity-50" : isZero ? "text-[var(--color-text-muted)]" : isGoodAct ? "text-[var(--color-success-text)]" : "text-amber-500"
                                          )}>
                                            {!hasActual ? (
                                              '-'
                                            ) : (
                                              <div className="flex flex-col items-center justify-center">
                                                <span>{act}</span>
                                                {line.notes && line.notes[timeIdx] && (
                                                  <span 
                                                    className="text-[8px] md:text-[8.5px] font-normal text-white whitespace-nowrap leading-tight mt-0.5 block max-w-full truncate"
                                                    title={line.notes[timeIdx]}
                                                  >
                                                    {line.notes[timeIdx]}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                          <td className={cn(
                                            "px-2 py-2 text-sm font-bold bg-[var(--color-bg-card)]/30",
                                            !hasActual ? "text-[var(--color-text-muted)] opacity-50" : isZero ? "text-[var(--color-text-muted)] opacity-50" : isGoodAchieve ? "text-blue-500 dark:text-blue-400" : "text-rose-500 dark:text-rose-400"
                                          )}>
                                            {!hasActual ? '-' : isZero ? '-' : `${percent}%`}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Total Actual Footer */}
                              <div className="bg-[var(--color-surface)]/30 p-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
                                <div>
                                  <p className="text-[8.5px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest leading-tight">
                                    Achievement
                                  </p>
                                  <p className="text-sm font-black text-[var(--color-text-main)]">
                                    {lineAchievement}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8.5px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest leading-tight">
                                    Total Actual
                                  </p>
                                  <p 
                                    className="text-xl font-black leading-none transition-all duration-300"
                                    style={{
                                      color: meta.color,
                                      textShadow: `0 0 10px ${meta.glow}`
                                    }}
                                  >
                                    <AnimatedNumber value={lineTotalActual} />
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── REDESIGNED DASHBOARD-STYLE SYSTEM INTELLIGENCE PANEL ── */}
            {data.lines.length > 0 && (
              <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm overflow-hidden p-5 md:p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="hidden md:flex bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h3 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.16em] mb-4">
                      System Intelligence
                    </h3>

                    {(() => {
                      let totalTarget = 0;
                      let totalActual = 0;
                      
                      const lineStats = data.lines.map(line => {
                        const tgt = line.target.reduce((a,b)=>a+(b||0),0);
                        const act = line.actual.reduce((a,b)=>a+(b||0),0);
                        let hoursHit = 0;
                        let activeHours = 0;
                        line.target.forEach((t, i) => {
                           const a = line.actual[i] || 0;
                           if (t > 0) {
                              activeHours++;
                              if (a >= t) hoursHit++;
                           }
                        });
                        totalTarget += tgt;
                        totalActual += act;
                        
                        return {
                           id: line.line_id,
                           item: line.item || 'Style',
                           tgt, act,
                           achieve: tgt > 0 ? (act/tgt)*100 : 0,
                           consistency: activeHours > 0 ? (hoursHit/activeHours)*100 : 0
                        };
                      });

                      const overallAchieve = totalTarget > 0 ? (totalActual/totalTarget)*100 : 0;
                      
                      // Calculate peak hour
                      let maxHourOutput = 0;
                      let peakHourIdx = -1;
                      if (data.timeLabels && data.timeLabels.length > 0) {
                        for (let h = 0; h < data.timeLabels.length; h++) {
                          let hourTotal = 0;
                          data.lines.forEach(l => {
                            hourTotal += (l.actual[h] || 0);
                          });
                          if (hourTotal > maxHourOutput) {
                            maxHourOutput = hourTotal;
                            peakHourIdx = h;
                          }
                        }
                      }

                      const sortedByAchieve = [...lineStats].sort((a,b) => b.achieve - a.achieve);
                      const bestLine = sortedByAchieve[0];
                      const worstLine = sortedByAchieve[sortedByAchieve.length - 1];
                      
                      const sortedByProduction = [...lineStats].sort((a,b) => b.act - a.act);
                      const topProducer = sortedByProduction[0];

                      const sortedByCons = [...lineStats].sort((a,b) => b.consistency - a.consistency);
                      const mostConsistent = sortedByCons[0];

                      const insights = [];

                      if (overallAchieve >= 90) {
                        insights.push(`<strong>PEAK FACTORY VELOCITY:</strong> Total floor achievement stands at <span class="text-emerald-400 font-bold">${overallAchieve.toFixed(1)}%</span> with <span class="text-[var(--color-primary)] font-bold">${totalActual.toLocaleString()} PCS</span> produced against <span class="text-amber-400 font-bold">${totalTarget.toLocaleString()} PCS</span> target.`);
                      } else {
                        insights.push(`<strong>HOURLY TARGET DEFICIT:</strong> Total floor achievement currently stands at <span class="text-amber-400 font-bold">${overallAchieve.toFixed(1)}%</span> (${totalActual.toLocaleString()} of <span class="text-rose-400 font-bold">${totalTarget.toLocaleString()} PCS</span> target), leaving a gap of <span class="text-rose-400 font-bold">${Math.max(0, totalTarget - totalActual).toLocaleString()} units</span>.`);
                      }

                      if (topProducer && topProducer.act > 0) {
                        const share = totalActual > 0 ? Math.round((topProducer.act / totalActual) * 100) : 0;
                        insights.push(`<strong>VOLUME LEADERSHIP:</strong> <span class="text-[var(--color-primary)] font-bold">Line ${topProducer.id}</span> (${topProducer.item}) generated the highest output with <span class="text-emerald-400 font-bold">${topProducer.act.toLocaleString()} PCS</span> (${share}% of total daily volume).`);
                      }

                      if (bestLine && bestLine.achieve > 0) {
                        insights.push(`<strong>TOP PERFORMING LINE:</strong> <span class="text-[var(--color-primary)] font-bold">Line ${bestLine.id}</span> leads floor efficiency with an achievement rate of <span class="text-emerald-400 font-bold">${bestLine.achieve.toFixed(1)}%</span>.`);
                      }

                      if (peakHourIdx !== -1 && maxHourOutput > 0) {
                        insights.push(`<strong>PEAK PRODUCTION WINDOW:</strong> Highest output velocity recorded at <span class="text-[var(--color-primary)] font-bold">${data.timeLabels[peakHourIdx]}</span> delivering <span class="text-emerald-400 font-bold">${maxHourOutput.toLocaleString()} units</span> across active lines.`);
                      }

                      if (mostConsistent && mostConsistent.consistency > 0) {
                        insights.push(`<strong>CONSISTENCY BENCHMARK:</strong> <span class="text-[var(--color-primary)] font-bold">Line ${mostConsistent.id}</span> demonstrated greatest pacing stability, meeting hourly targets in <span class="text-emerald-400 font-bold">${mostConsistent.consistency.toFixed(0)}%</span> of active shift hours.`);
                      }

                      if (worstLine && worstLine.tgt > 0 && worstLine.id !== bestLine?.id) {
                        insights.push(`<strong>CRITICAL FLOOR BOTTLENECK:</strong> <span class="text-rose-400 font-bold">Line ${worstLine.id}</span> requires immediate floor pacing, running at the lowest achievement rate of <span class="text-rose-400 font-bold">${worstLine.achieve.toFixed(1)}%</span>.`);
                      }

                      insights.push(`<strong>TACTICAL DIRECTIVE:</strong> Re-balance line bottlenecks and maintain hourly piece pacing to sustain floor targets into final shift hours.`);

                      return (
                        <ul className="space-y-3 w-full divide-y divide-[var(--color-border)]/30">
                          {insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2.5 pt-3 first:pt-0">
                              <span className="text-[var(--color-text-muted)] font-black text-sm select-none shrink-0 leading-relaxed">•</span>
                              <span 
                                className="text-xs sm:text-[13px] font-normal text-slate-400 dark:text-zinc-400 text-[var(--color-text-secondary)] leading-relaxed flex-1 [&>strong]:text-slate-300 [&>strong]:dark:text-zinc-300 [&>strong]:font-semibold"
                                dangerouslySetInnerHTML={{ __html: insight }}
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
