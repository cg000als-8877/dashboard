import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { DailyPerformanceChart, IncomeVsCostChart } from '@/components/dashboard/DashboardCharts';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Sparkles, ArrowRight, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { RealTimeClock } from '@/components/ui/RealTimeClock';
import { PrintableArchiveReport } from '@/components/report/PrintableArchiveReport';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { DashboardSkeleton } from '@/components/ui/Skeletons';

export function DashboardContent({ month, isArchive = false }) {
  const { stats, dailyTrends, insights, lines, loading, error } = useKpiData(month);
  const [interactiveDay, setInteractiveDay] = useState(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef(null);

  const generatePdf = async () => {
    // We use the browser's native print engine for perfect color rendering (supports LAB/OKLCH colors natively)
    setIsGeneratingPdf(true);
    
    // Give React a tiny moment to ensure the PrintableArchiveReport is fully in the DOM
    setTimeout(() => {
      window.print();
      setIsGeneratingPdf(false);
    }, 500);
  };

  useEffect(() => {
    setInteractiveDay(null);
  }, [month]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20 font-medium bg-[rgba(255,0,0,0.1)] p-4 rounded-xl border border-red-500/20">Error loading data: {error}</div>;
  }

  const startDate = dailyTrends?.length > 0 ? dailyTrends[0].date : null;
  const endDate = dailyTrends?.length > 0 ? dailyTrends[dailyTrends.length - 1].date : null;
  
  let dateText = '';
  let dateComponents = null;
  let currentCalendarDay = 1;
  if (startDate && endDate) {
    const formatStr = 'do MMMM, yyyy';
    dateText = `from ${format(parseISO(startDate), 'do')} to ${format(parseISO(endDate), formatStr)}`;
    dateComponents = {
      startDay: format(parseISO(startDate), 'do'),
      endDay: format(parseISO(endDate), 'do'),
      month: format(parseISO(endDate), 'MMMM'),
      year: format(parseISO(endDate), 'yyyy')
    };
    currentCalendarDay = parseInt(endDate.split('-')[2], 10);
  }

  const maxDays = dailyTrends?.length || 1;
  const displayDay = interactiveDay !== null ? interactiveDay : currentCalendarDay;
  const currentDayData = dailyTrends && dailyTrends.length >= displayDay ? dailyTrends[displayDay - 1] : null;

  return (
    <>
      <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both] no-print">
      {/* Titanic Animation (Live Dashboard Only) */}
      {!isArchive && (
        <div className="flex flex-col gap-2 relative z-10 -mt-10 md:-mt-8 -mx-4 md:-mx-8 md:w-[calc(100%+4rem)]">
          <div className={`w-full transition-all duration-700 ease-in-out origin-top overflow-hidden border-none rounded-none ${showAnimation ? 'max-h-[800px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
            <TitanicAnimation netProfit={stats.netProfit} simDay={displayDay} />
          </div>
        </div>
      )}

      {/* Hero Statistics */}
      <div className={isArchive ? "mt-4" : "mt-0 md:mt-4"}>
        {dateComponents && (
          <div className="flex justify-center mb-1 md:mb-2 w-full relative z-10">
            <span className="inline-flex items-baseline gap-1.5 text-xs md:text-sm font-medium tracking-widest text-[var(--color-text-secondary)] uppercase">
              from {dateComponents.startDay} to {dateComponents.endDay} <span className="text-[110%] font-bold text-[var(--color-primary)]">{dateComponents.month}</span>, {dateComponents.year}
            </span>
          </div>
        )}

        {!isArchive && (
          <div className="mb-3 md:mb-10 flex flex-col items-center justify-center relative z-10">
            <div className="flex flex-col items-center relative z-10 text-center">

              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
                Factory System Overview
              </h2>
            </div>
            
            <button 
              onClick={() => setShowAnimation(!showAnimation)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-all active:scale-95"
            >
              {showAnimation ? 'Hide Visualizer' : 'Show Visualizer'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <MetricCard 
            title="Total Cost" 
            value={<AnimatedNumber value={Math.round(stats.totalCost)} prefix="BDT " />} 
            color="warning"
          />
          <MetricCard 
            title="Total Income" 
            value={<AnimatedNumber value={Math.round(stats.totalIncome)} prefix="BDT " />}
            color="primary"
          />
          <MetricCard 
            title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"} 
            value={<AnimatedNumber value={Math.abs(Math.round(stats.netProfit))} prefix={stats.netProfit >= 0 ? "+BDT " : "BDT -"} />}
            color={stats.netProfit >= 0 ? 'success' : 'danger'}
          />
          <MetricCard 
            title="Working Days" 
            value={<AnimatedNumber value={stats.workingDays} suffix=" Days" />} 
          />
          <MetricCard 
            title="Production Lines" 
            value={<AnimatedNumber value={stats.activeLinesCount} suffix=" Active" />} 
          />
          <MetricCard 
            title={stats.averageDailyProfit >= 0 ? "Avg Daily Profit" : "Avg Daily Loss"} 
            value={<AnimatedNumber value={Math.abs(Math.round(stats.averageDailyProfit))} prefix={stats.averageDailyProfit >= 0 ? "+" : "-"} suffix=" / day" />}
            color={stats.averageDailyProfit >= 0 ? 'success' : 'danger'}
          />
        </div>
      </div>



      {/* PDF Download Action (Archive Only) - HIDDEN FOR NOW */}
      {isArchive && (
        <div className="hidden justify-center md:justify-end mt-10 relative z-10">
          <button 
            onClick={generatePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-xl font-bold uppercase tracking-widest transition-all [box-shadow:0_0_20px_var(--color-primary-glow)] hover:[box-shadow:0_0_30px_var(--color-primary-glow-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                GENERATING PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                DOWNLOAD {month.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}

      {/* July PDF Download Button (Archive Only) */}
      {month === '2026-07' && (
        <div className="flex justify-center mt-10 mb-2 relative z-10">
          <button 
            onClick={() => window.open('https://drive.google.com/file/d/1GWGOeDtG3mvxW7T8y0w64UHg75jBR-Bv/view?usp=sharing', '_blank')}
            className="flex items-center gap-3 bg-[var(--color-danger)] hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl transition-all [box-shadow:0_0_20px_var(--color-danger-glow)] hover:[box-shadow:0_0_30px_var(--color-danger-glow)] text-[10px] sm:text-xs uppercase tracking-widest active:scale-95"
          >
            <span>Download PDF of July Sheets</span>
            <div className="w-[1px] h-5 bg-white/40 rounded-full mx-1"></div>
            <FileText size={18} />
          </button>
        </div>
      )}

      {/* Production Lines Horizontal Dashboard */}
      <div className="mt-12 mb-10 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-[var(--color-text-main)]">Line Diagnostics</h2>
        </div>
        <div className="flex flex-col gap-5">
          {lines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
            return (
              <Card key={line.id} className="relative overflow-hidden w-full p-0 mt-2">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none rounded-[inherit]"></div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 justify-between w-full p-3 md:p-5 relative z-10">
                  
                  <div className="flex-shrink-0 w-full lg:w-56 xl:w-64 lg:border-r lg:border-[var(--color-border)] lg:pr-6 flex flex-col justify-center">
                    
                    <div className="flex items-center justify-between mb-1.5 md:mb-2 w-full">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">{line.name}</h2>
                        {/* Desktop Warning Light */}
                        <div className={`hidden lg:flex w-2.5 h-2.5 rounded-full shadow-lg ${
                          line.netProfit >= 0 
                          ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' 
                          : 'bg-red-500 shadow-[0_0_12px_#ff3b30] animate-pulse'
                        }`} title={line.netProfit >= 0 ? "Optimal" : "Critical"} />
                      </div>
                      
                      {/* Mobile Badge */}
                      <span className={`lg:hidden inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-all ${
                            line.netProfit >= 0 
                            ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' 
                            : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.4)] shadow-[0_0_10px_rgba(255,59,48,0.3)] animate-[pulse_0.6s_ease-in-out_infinite]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${line.netProfit >= 0 ? 'bg-emerald-400 shadow-[0_0_5px_#10b981] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_#ff3b30]'}`}></span>
                            {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
                      </span>
                    </div>
                    
                    <div className="text-[10px] md:text-xs font-semibold tracking-tight uppercase flex items-center gap-1.5 mb-1 md:mb-1">
                      <span className="text-[var(--color-text-muted)]">ITEM :</span>
                      <span className="text-[var(--color-primary)]">
                        {line.today?.item || (
                          line.name.includes('A') ? 'Flannel Shirt' :
                          line.name.includes('B') ? 'Ladies Top' :
                          line.name.includes('C') ? 'Ladies Bottom' :
                          line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap md:flex-nowrap w-full gap-2 md:gap-4 justify-between">
                    <div className="bg-[var(--color-surface)] p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Production</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-[var(--color-text-main)]">
                        <AnimatedNumber value={line.totalProduction} />
                        <span className="text-[10px] md:text-xs text-[var(--color-text-muted)] ml-1">PCS</span>
                      </p>
                    </div>
                    
                    <div className="bg-[var(--color-surface)] p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Income</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-[var(--color-primary)]">
                        <AnimatedNumber value={Math.round(line.totalIncome)} prefix="BDT " />
                      </p>
                    </div>

                    <div className="bg-[var(--color-surface)] p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-sm transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Cost</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-amber-500">
                        <AnimatedNumber value={Math.round(line.totalCost)} prefix="BDT " />
                      </p>
                    </div>

                    <div className={`bg-[var(--color-surface)] p-2.5 md:p-4 rounded-xl md:rounded-2xl border flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-sm transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-[var(--color-success-glow)]' : 'border-[rgba(255,59,48,0.15)] bg-[var(--color-danger-glow)]'}`}>
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                      <p className={`text-base md:text-xl font-semibold md:font-bold [filter:var(--shadow-text)] ${line.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                        <AnimatedNumber value={Math.round(line.netProfit)} prefix="BDT " />
                      </p>
                    </div>
                  </div>



                </div>
                {/* Decorative side accent */}
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: line.netProfit >= 0 ? '#10b981' : '#ff3b30' }}></div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI Insights Panel (Live Dashboard Only) */}
      {!isArchive && (
        <div className="mt-4">
          <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm overflow-hidden p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="w-full">
                <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-4">
                  System Intelligence
                </h3>
                <ul className="space-y-2.5 w-full">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0"></span>
                      <span className="text-sm font-medium text-[var(--color-text-main)] leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="mt-14 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-[var(--color-text-main)]">Performance Telemetry</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyPerformanceChart data={dailyTrends} />
          <IncomeVsCostChart data={dailyTrends} />
        </div>
      </div>
      


      </div>

      {/* Hidden Printable PDF Component */}
      {isArchive && (
        <PrintableArchiveReport month={month} />
      )}
    </>
  );
}
