"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Clock, Calendar as CalendarIcon, RefreshCw, AlertTriangle, Sparkles, TrendingUp, Activity, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/components/layout/Sidebar';

import { format, parseISO } from 'date-fns';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { NetworkLoader } from '@/components/ui/NetworkLoader';

// In-memory cache for instant page switching
const hourlyCache = {
  dates: null,
  data: {}
};

export default function HourlyPage() {
  const dateInputRef = useRef(null);
  const [availableDates, setAvailableDates] = useState(hourlyCache.dates || []);
  const [selectedDate, setSelectedDate] = useState(hourlyCache.dates ? hourlyCache.dates[0] : '');
  const [data, setData] = useState(selectedDate && hourlyCache.data[selectedDate] ? hourlyCache.data[selectedDate] : null);
  const [loading, setLoading] = useState(!data);
  const [mobileLineIndex, setMobileLineIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFactoryTableExpanded, setIsFactoryTableExpanded] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isFactoryTableExpanded) {
      timeoutId = setTimeout(() => {
        setIsFactoryTableExpanded(false);
      }, 15000);
    }
    return () => clearTimeout(timeoutId);
  }, [isFactoryTableExpanded]);

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
    return <NetworkLoader />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] p-4 md:p-6 xl:p-8">
      <div className="w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-xl md:text-5xl font-bold tracking-tighter uppercase mb-1 md:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)]">
              Hourly Tracking {selectedDate && <span className="opacity-80">- {format(parseISO(selectedDate), 'dd MMM, yy')}</span>}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-[10px] md:text-base tracking-wide font-medium flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
              <Clock className="hidden md:block md:w-4 md:h-4 text-[var(--color-primary)]" />
              Intraday production breakdown
            </p>
          </div>
          
          <div className="relative group w-full md:w-auto z-30">
            <div 
              onClick={() => {
                if (dateInputRef.current) {
                  try {
                    dateInputRef.current.showPicker();
                  } catch (e) {
                    dateInputRef.current.focus();
                  }
                }
              }}
              className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-main)] py-2.5 md:py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all duration-200 hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 font-semibold cursor-pointer shadow-sm active:scale-[0.98] relative overflow-hidden"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <span className="truncate text-xs md:text-sm font-semibold">
                  {selectedDate 
                    ? selectedDate === availableDates[0] ? `Today (${formatDate(selectedDate)})` : formatDate(selectedDate)
                    : 'Select Date'}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2.5 py-1 rounded-lg shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Pick Date
                </span>
              </div>

              <input 
                ref={dateInputRef}
                type="date"
                value={selectedDate || ''}
                min={availableDates.length > 0 ? availableDates[availableDates.length - 1] : ''}
                max={availableDates.length > 0 ? availableDates[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>

        {!data || !data.lines || data.lines.length === 0 ? (
           <Card className="flex flex-col items-center justify-center p-12 text-center">
             <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 opacity-80" />
             <h3 className="text-xl font-bold mb-2">No Hourly Data Available</h3>
             <p className="text-[var(--color-text-secondary)]">We couldn't find hourly records for {selectedDate}.</p>
           </Card>
        ) : (
          <div className="space-y-8">
            {/* Factory Overview Summary */}
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

              return (
                <Card className="p-0 overflow-hidden border-2 border-indigo-500/20 bg-gradient-to-b from-[var(--color-bg-card)] to-[var(--color-surface)] shadow-lg">
                  <div className="p-4 md:p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left w-full md:w-auto">
                      <h2 className="text-lg md:text-4xl font-bold tracking-tight text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                        TOTAL PRODUCTION
                      </h2>
                      <p className="text-[10px] md:text-base text-[var(--color-text-secondary)] font-medium mt-0.5 md:mt-1">
                        SUMMARY OF ALL PRODUCTION LINES COMBINED
                      </p>
                    </div>
                    <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                      {/* Desktop Summary */}
                      <div className="hidden md:flex bg-[var(--color-bg-card)] rounded-xl p-3 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-[var(--color-border)] w-auto">
                        <div className="flex-1 text-center border-r border-[var(--color-border)] px-6">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-1 whitespace-nowrap">Total Target</p>
                          <p className="text-lg font-bold text-[var(--color-text-main)]"><AnimatedNumber value={factoryTotalTarget} /></p>
                        </div>
                        <div className="flex-1 text-center border-r border-[var(--color-border)] px-6">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-1 whitespace-nowrap">Total Actual</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400"><AnimatedNumber value={factoryTotalActual} /></p>
                        </div>
                        <div className="flex-1 text-center px-6">
                          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold mb-1 whitespace-nowrap">Achievement</p>
                          <p className={cn(
                            "text-xl font-black",
                            (factoryAchievement >= 100) ? "text-[var(--color-success-text)]" : "text-amber-500"
                          )}>
                            <AnimatedNumber value={factoryAchievement} suffix="%" />
                          </p>
                        </div>
                      </div>

                      {/* Mobile Pie Style Summary */}
                      <div className="flex md:hidden w-full bg-[var(--color-bg-card)] rounded-2xl p-4 shadow-[0_4_15px_rgba(0,0,0,0.2)] border border-[var(--color-border)] items-center justify-between">
                        <div className="flex flex-col gap-4">
                          {/* Target */}
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-slate-400 dark:bg-gray-500 rounded-full" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-bold">Target</span>
                              <span className="text-xl font-black text-[var(--color-text-main)] leading-none mt-0.5"><AnimatedNumber value={factoryTotalTarget} /></span>
                            </div>
                          </div>
                          {/* Actual */}
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-bold">Actual</span>
                              <span className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none mt-0.5"><AnimatedNumber value={factoryTotalActual} /></span>
                            </div>
                          </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle 
                              cx="50" cy="50" r="40" 
                              stroke="var(--color-surface)" strokeWidth="8" fill="none" 
                            />
                            {/* Progress */}
                            <circle 
                              cx="50" cy="50" r="40" 
                              stroke={(factoryAchievement >= 100) ? "var(--color-success-text)" : "#f59e0b"} 
                              strokeWidth="8" 
                              strokeLinecap="round"
                              fill="none" 
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(factoryAchievement, 100) / 100)}
                              className="transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <AnimatedNumber 
                              value={factoryAchievement} 
                              className={cn(
                                "text-xl font-black tracking-tighter",
                                (factoryAchievement >= 100) ? "text-[var(--color-success-text)]" : "text-amber-500"
                              )} 
                            />
                            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] -mt-1">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block overflow-x-auto w-full hide-scrollbar">
                    <table className="w-full text-left border-collapse table-auto min-w-[800px]">
                      <thead>
                        <tr className="bg-[var(--color-bg-card)]">
                          <th className="px-4 py-4 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-bold border-b border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-bg-card)] z-10 w-32">
                            Summary
                          </th>
                          {data.timeLabels.map((time, idx) => (
                          <th key={idx} className="px-3 py-4 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold text-center border-b border-r border-[var(--color-border)] last:border-r-0">
                            {time}
                          </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors group">
                          <td className="px-4 py-4 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors border-r border-[var(--color-border)] sticky left-0 z-10">Target</td>
                          {data.timeLabels.map((_, idx) => (
                            <td key={`target-${idx}`} className="px-3 py-4 text-sm font-semibold text-center text-[var(--color-text-secondary)] border-r border-[var(--color-border)] last:border-r-0 opacity-80">
                              {factoryTargetHourly[idx] || 0}
                            </td>
                          ))}
                        </tr>
                        {/* Actual Row */}
                        <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors group">
                          <td className="px-4 py-4 text-sm font-bold text-[var(--color-primary)] border-r border-[var(--color-border)] sticky left-0 z-10 bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors">
                            Actual
                          </td>
                          {data.timeLabels.map((_, idx) => {
                            const act = factoryActualHourly[idx] || 0;
                            const tgt = factoryTargetHourly[idx] || 0;
                            const isGood = act >= tgt && tgt > 0;
                            const isZero = act === 0 && tgt === 0;
                            
                            return (
                              <td key={`actual-${idx}`} className={cn(
                                "px-3 py-4 text-base text-center border-r border-[var(--color-border)] last:border-r-0 font-extrabold",
                                isZero ? "text-[var(--color-text-muted)]" : isGood ? "text-[var(--color-success-text)] drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                              )}>
                                {act}
                              </td>
                            );
                          })}
                        </tr>
                        {/* Achievement Row */}
                        <tr className="hover:bg-[var(--color-surface)]/50 transition-colors group">
                          <td className="px-4 py-4 text-xs font-bold text-[var(--color-text-secondary)] border-r border-[var(--color-border)] sticky left-0 z-10 bg-[var(--color-bg-card)] group-hover:bg-[var(--color-surface)] transition-colors whitespace-nowrap">
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
                                "px-3 py-4 text-base text-center border-r border-[var(--color-border)] last:border-r-0 font-bold bg-[var(--color-bg-card)]/30",
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

                  {/* Expandable Mobile View Section */}
                  <div className="block md:hidden w-full relative">
                    <div 
                      onClick={() => !isFactoryTableExpanded && setIsFactoryTableExpanded(true)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-b from-[var(--color-bg-card)] to-transparent hover:bg-[var(--color-surface)]/40 transition-all duration-500 relative overflow-hidden group",
                        isFactoryTableExpanded ? "max-h-0 py-0 opacity-0 border-transparent" : "max-h-20 py-4 opacity-100 border-t border-[var(--color-border)]"
                      )}
                    >
                      {/* Liquid highlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/5 to-blue-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                      
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors relative z-10 drop-shadow-[0_0_8px_rgba(37,99,235,0)] group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]">
                        Click to Expand
                      </span>
                      <ChevronDown 
                        className="w-3.5 h-3.5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-all duration-500 relative z-10 animate-bounce"
                      />
                    </div>
                    
                    <div className={cn(
                      "w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-[var(--color-bg-card)]/30",
                      isFactoryTableExpanded ? "max-h-[2000px] opacity-100 border-t border-[var(--color-border)]" : "max-h-0 opacity-0"
                    )}>
                      <div className="overflow-x-auto w-full hide-scrollbar">
                        <table className="w-full text-center border-collapse table-fixed min-w-[200px]">
                          <thead>
                            <tr className="bg-[var(--color-bg-card)]">
                              <th className="px-2 py-2.5 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                Hour
                              </th>
                              <th className="px-2 py-2.5 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                Target
                              </th>
                              <th className="px-2 py-2.5 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                                Actual
                              </th>
                              <th className="px-2 py-2.5 text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold border-b border-[var(--color-border)] w-1/4">
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
                    </div>
                  </div>
                </Card>
              );
            })()}

            <div className="md:hidden flex justify-center w-full mb-4 px-1">
              <div className="flex overflow-x-auto gap-2 hide-scrollbar py-1.5 px-1.5 relative bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] shadow-sm max-w-full">
                {/* Liquid Sliding Background */}
                <div 
                  className="absolute top-1.5 bottom-1.5 w-[72px] rounded-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"
                  style={{
                    transform: `translateX(${mobileLineIndex * (72 + 8)}px)`
                  }}
                >
                  <div className="absolute inset-0 rounded-lg overflow-hidden border border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
                    <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] opacity-30"
                         style={{ background: 'conic-gradient(from 0deg, transparent 70%, var(--color-primary) 100%)' }}>
                    </div>
                    <div className="absolute inset-[1px] rounded-[7px] bg-[var(--color-bg-card)]"></div>
                  </div>
                </div>

                {data.lines.map((line, idx) => {
                  const isActive = idx === mobileLineIndex;
                  return (
                    <button
                      key={`tab-${line.line_id}`}
                      onClick={() => setMobileLineIndex(idx)}
                      className={cn(
                        "relative w-[72px] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 flex items-center justify-center shrink-0 z-10",
                        isActive 
                          ? "text-[var(--color-primary)] drop-shadow-[0_0_2px_rgba(37,99,235,0.2)]" 
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      LINE {line.line_id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6">
              {data.lines.map((line, idx) => (
                <div key={line.line_id} className={cn(
                  "md:block h-full transition-all duration-300",
                  idx === mobileLineIndex ? "block animate-[fade-in_0.3s_ease-out]" : "hidden"
                )}>
                  <Card className="p-0 overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="bg-[var(--color-surface)]/50 pt-3 pb-2 flex justify-center border-b border-[var(--color-border)]">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-1 rounded-full text-sm font-bold shadow-md shadow-indigo-500/20">
                        LINE {line.line_id}
                      </div>
                    </div>
                    
                    <div className="p-2 md:p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/30">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 md:gap-2">
                        {/* Buyer */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md md:rounded-lg p-1.5 md:p-2 shadow-sm flex items-center gap-1.5 md:gap-2">
                          <div className="w-1 h-full min-h-[20px] md:min-h-[28px] lg:min-h-[20px] rounded-full bg-emerald-500 flex-shrink-0"></div>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full min-w-0 overflow-hidden">
                            <span className="text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-medium leading-tight">Buyer</span>
                            <span className="text-[10px] md:text-xs lg:text-[11px] font-semibold text-[var(--color-text-main)] truncate text-left lg:text-right">{line.buyer || 'N/A'}</span>
                          </div>
                        </div>
                        {/* Style */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md md:rounded-lg p-1.5 md:p-2 shadow-sm flex items-center gap-1.5 md:gap-2">
                          <div className="w-1 h-full min-h-[20px] md:min-h-[28px] lg:min-h-[20px] rounded-full bg-blue-500 flex-shrink-0"></div>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full min-w-0 overflow-hidden">
                            <span className="text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-medium leading-tight">Style</span>
                            <span className="text-[10px] md:text-xs lg:text-[11px] font-semibold text-[var(--color-text-main)] truncate text-left lg:text-right">{line.style || 'N/A'}</span>
                          </div>
                        </div>
                        {/* Item */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md md:rounded-lg p-1.5 md:p-2 shadow-sm flex items-center gap-1.5 md:gap-2">
                          <div className="w-1 h-full min-h-[20px] md:min-h-[28px] lg:min-h-[20px] rounded-full bg-purple-500 flex-shrink-0"></div>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full min-w-0 overflow-hidden">
                            <span className="text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-medium leading-tight">Item</span>
                            <span className="text-[10px] md:text-xs lg:text-[11px] font-semibold text-[var(--color-text-main)] truncate text-left lg:text-right">{line.item || 'N/A'}</span>
                          </div>
                        </div>
                        {/* MP */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md md:rounded-lg p-1.5 md:p-2 shadow-sm flex items-center gap-1.5 md:gap-2">
                          <div className="w-1 h-full min-h-[20px] md:min-h-[28px] lg:min-h-[20px] rounded-full bg-amber-500 flex-shrink-0"></div>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full min-w-0 overflow-hidden">
                            <span className="text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-medium leading-tight">Manpower</span>
                            <span className="text-[10px] md:text-xs lg:text-[11px] font-semibold text-[var(--color-text-main)] truncate text-left lg:text-right">{line.mp || '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto w-full flex-grow hide-scrollbar">
                      <table className="w-full text-center border-collapse table-fixed min-w-[200px]">
                        <thead>
                          <tr className="bg-[var(--color-bg-card)]">
                            <th className="px-1 py-2 text-[8px] md:text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                              Hour
                            </th>
                            <th className="px-1 py-2 text-[8px] md:text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                              Target
                            </th>
                            <th className="px-1 py-2 text-[8px] md:text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-r border-[var(--color-border)] w-1/4">
                              Actual
                            </th>
                            <th className="px-1 py-2 text-[8px] md:text-[9px] lg:text-[10px] uppercase text-[var(--color-text-secondary)] font-bold border-b border-[var(--color-border)] w-1/4 truncate">
                              Achieve
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.timeLabels.map((time, timeIdx) => {
                            const tgt = line.target[timeIdx] || 0;
                            const act = line.actual[timeIdx] || 0;
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
                              <tr key={`line-row-${timeIdx}`} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/50 transition-colors">
                                <td className="px-2 py-2.5 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-surface)]/30 border-r border-[var(--color-border)]">
                                  {serialTime}
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
                    
                    <div className="bg-[var(--color-surface)]/30 p-3 border-t border-[var(--color-border)] flex flex-col items-center justify-center mt-auto">
                      <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest mb-1">Total Actual</p>
                      <p className="text-2xl font-bold text-[var(--color-primary)] leading-none">
                        <AnimatedNumber value={line.actual.reduce((a, b) => a + (b || 0), 0)} />
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Smart Intelligence Section */}
            {data.lines.length > 0 && (
              <Card className="p-4 md:p-6 border border-indigo-500/30 bg-gradient-to-br from-[var(--color-bg-card)] to-indigo-950/10 dark:to-indigo-900/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6 relative z-10">
                  <div className="p-1.5 md:p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      Smart Analytics Report
                    </h3>
                    <p className="text-[10px] md:text-xs text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5 md:mt-1">Real-time AI Insights</p>
                  </div>
                </div>
                
                <div className="space-y-2 md:space-y-4 relative z-10">
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
                         tgt, act,
                         achieve: tgt > 0 ? (act/tgt)*100 : 0,
                         consistency: activeHours > 0 ? (hoursHit/activeHours)*100 : 0
                      }
                    });

                    let peakHourIdx = -1;
                    let maxHourOutput = -1;
                    for (let i = 0; i < data.timeLabels.length; i++) {
                       let sum = 0;
                       data.lines.forEach(l => sum += (l.actual[i] || 0));
                       if (sum > maxHourOutput) {
                          maxHourOutput = sum;
                          peakHourIdx = i;
                       }
                    }
                    
                    const overallAchieve = totalTarget > 0 ? (totalActual/totalTarget)*100 : 0;
                    
                    const sortedByAchieve = [...lineStats].sort((a,b) => b.achieve - a.achieve);
                    const bestLine = sortedByAchieve[0];
                    const worstLine = sortedByAchieve[sortedByAchieve.length - 1];
                    
                    const sortedByCons = [...lineStats].sort((a,b) => b.consistency - a.consistency);
                    const mostConsistent = sortedByCons[0];

                    const insights = [];
                    insights.push({ icon: Activity, text: `Overall factory achievement currently stands at ${overallAchieve.toFixed(1)}% (${totalActual.toLocaleString()} / ${totalTarget.toLocaleString()} units).`});
                    
                    if (bestLine && bestLine.achieve > 0) {
                      insights.push({ icon: TrendingUp, text: `Line ${bestLine.id} is leading performance with a stellar ${bestLine.achieve.toFixed(1)}% achievement rate.`});
                    }
                    
                    if (peakHourIdx !== -1 && maxHourOutput > 0) {
                      insights.push({ icon: Clock, text: `Peak production occurred during ${data.timeLabels[peakHourIdx]} with ${maxHourOutput} units produced factory-wide.`});
                    }

                    if (mostConsistent && mostConsistent.consistency > 0) {
                      insights.push({ icon: Sparkles, text: `Line ${mostConsistent.id} is the most consistent, successfully hitting its hourly target ${mostConsistent.consistency.toFixed(0)}% of the active hours.`});
                    }

                    if (worstLine && worstLine.tgt > 0 && worstLine.id !== bestLine?.id) {
                      insights.push({ icon: AlertTriangle, text: `Line ${worstLine.id} requires attention, currently running at the lowest achievement rate of ${worstLine.achieve.toFixed(1)}%.`});
                    }
                    
                    if (overallAchieve >= 95) {
                      insights.push({ icon: Sparkles, text: "Overall summary: The factory is operating at peak efficiency today. Keep up the incredible momentum!"});
                    } else if (overallAchieve >= 80) {
                      insights.push({ icon: Activity, text: "Overall summary: The factory is performing well, but slight improvements across underperforming lines could help us reach daily targets."});
                    } else if (totalTarget > 0) {
                      insights.push({ icon: AlertTriangle, text: "Overall summary: The factory is falling significantly behind daily targets. Immediate floor intervention and bottleneck analysis is recommended."});
                    }

                    return insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:border-indigo-500/30 transition-colors">
                        <insight.icon className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-[var(--color-text-secondary)] leading-relaxed text-xs md:text-sm font-medium">
                          {insight.text}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
