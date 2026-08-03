import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { useKpiData } from '@/utils/useKpiData';
import { MetricCard, Card } from '@/components/ui/Card';
import { DailyPerformanceChart, IncomeVsCostChart } from '@/components/dashboard/DashboardCharts';
import { TitanicAnimation } from '@/components/ui/TitanicAnimation';
import { Sparkles, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { RealTimeClock } from '@/components/ui/RealTimeClock';
import { PrintableArchiveReport } from '@/components/report/PrintableArchiveReport';

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
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20 font-medium bg-[rgba(255,0,0,0.1)] p-4 rounded-xl border border-red-500/20">Error loading data: {error}</div>;
  }

  const startDate = dailyTrends?.length > 0 ? dailyTrends[0].date : null;
  const endDate = dailyTrends?.length > 0 ? dailyTrends[dailyTrends.length - 1].date : null;
  
  let dateText = '';
  let currentCalendarDay = 1;
  if (startDate && endDate) {
    const formatStr = 'do MMMM, yyyy';
    dateText = `from ${format(parseISO(startDate), 'do')} to ${format(parseISO(endDate), formatStr)}`;
    currentCalendarDay = parseInt(endDate.split('-')[2], 10);
  }

  const maxDays = dailyTrends?.length || 1;
  const displayDay = interactiveDay !== null ? interactiveDay : currentCalendarDay;
  const currentDayData = dailyTrends && dailyTrends.length >= displayDay ? dailyTrends[displayDay - 1] : null;

  return (
    <>
      <div className="space-y-8 animate-[fade-up_0.4s_ease-out_both] pb-10 no-print">
      {/* Titanic Animation (Live Dashboard Only) */}
      {!isArchive && (
        <div className="flex flex-col gap-2 relative z-10 -mt-10 md:mt-6 -mx-4 md:mx-0">
          <div className={`w-full transition-all duration-700 ease-in-out origin-top overflow-hidden border-none md:border md:rounded-2xl ${showAnimation ? 'max-h-[800px] opacity-100 mb-2 md:border-[var(--color-border)] md:shadow-2xl' : 'max-h-0 opacity-0 mb-0 md:border-transparent md:shadow-none'}`}>
            <TitanicAnimation netProfit={stats.netProfit} simDay={displayDay} />
          </div>
        </div>
      )}

      {/* Hero Statistics */}
      <div className={isArchive ? "mt-4" : "mt-2 md:mt-4"}>
        {!isArchive && (
          <div className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col items-start relative z-10">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-secondary)] to-[var(--color-text-muted)]">
                System Overview
              </h2>
              {dateText && (
                <span className="block mt-2 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs font-medium tracking-widest text-[var(--color-primary)] uppercase">
                  {dateText}
                </span>
              )}
            </div>
            
            <button 
              onClick={() => setShowAnimation(!showAnimation)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-all active:scale-95"
            >
              {showAnimation ? 'Hide Visualizer' : 'Show Visualizer'}
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <MetricCard 
            title="Total Cost" 
            value={`BDT ${Math.round(stats.totalCost).toLocaleString()}`} 
            color="warning"
          />
          <MetricCard 
            title="Total Income" 
            value={`BDT ${Math.round(stats.totalIncome).toLocaleString()}`}
            color="primary"
          />
          <MetricCard 
            title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"} 
            value={`${stats.netProfit > 0 ? '+BDT ' : 'BDT '}${Math.round(stats.netProfit).toLocaleString()}`}
            color={stats.netProfit >= 0 ? 'success' : 'danger'}
          />
          <MetricCard 
            title="Working Days" 
            value={`${stats.workingDays} Days`} 
          />
          <MetricCard 
            title="Production Lines" 
            value={`${stats.activeLinesCount} Active`} 
          />
          <MetricCard 
            title={stats.averageDailyProfit >= 0 ? "Avg Daily Profit" : "Avg Daily Loss"} 
            value={`${stats.averageDailyProfit > 0 ? '+' : ''}${Math.round(stats.averageDailyProfit).toLocaleString()} / day`}
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

      {/* Production Lines Horizontal Dashboard */}
      <div className="mt-12 mb-10 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-4 w-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-[var(--color-text-main)]">Line Diagnostics</h2>
        </div>
        <div className="flex flex-col gap-5">
          {lines.sort((a,b) => a.id.localeCompare(b.id)).map((line) => {
            return (
              <Card key={line.id} className="relative overflow-hidden w-full p-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--color-surface)] to-transparent pointer-events-none"></div>
                <div className="flex flex-col xl:flex-row items-center gap-4 md:gap-6 justify-between w-full p-3 md:p-5 relative z-10">
                  
                  <div className="flex-shrink-0 w-full xl:w-56 xl:border-r xl:border-[var(--color-border)] xl:pr-6">
                    <div className="flex items-center justify-between mb-2 md:mb-4 w-full">
                      <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-secondary)] [filter:var(--shadow-text)]">{line.name}</h2>
                      <span className={`inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                            line.netProfit >= 0 ? 'bg-[var(--color-success-glow)] text-[var(--color-success-text)] border border-[rgba(16,185,129,0.2)]' : 'bg-[var(--color-danger-glow)] text-[var(--color-danger-text)] border border-[rgba(255,59,48,0.2)]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${line.netProfit >= 0 ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-red-400 shadow-[0_0_5px_#ff3b30]'}`}></span>
                            {line.netProfit >= 0 ? 'Optimal' : 'Critical'}
                      </span>
                    </div>
                    <div className="text-[10px] md:text-xs font-medium tracking-normal uppercase flex items-center gap-1.5">
                      <span className="text-[var(--color-text-muted)]">ITEM &mdash;</span>
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
                    <div className="bg-[var(--color-surface)] backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Production</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-[var(--color-text-main)]">{line.totalProduction} <span className="text-[10px] md:text-xs text-[var(--color-text-muted)]">PCS</span></p>
                    </div>
                    
                    <div className="bg-[var(--color-surface)] backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Income</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-[var(--color-primary)]">BDT {Math.round(line.totalIncome).toLocaleString()}</p>
                    </div>

                    <div className="bg-[var(--color-surface)] backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-[var(--color-border)] flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">Cost</p>
                      <p className="text-base md:text-xl font-semibold md:font-bold text-amber-500">BDT {Math.round(line.totalCost).toLocaleString()}</p>
                    </div>

                    <div className={`bg-[var(--color-surface)] backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border flex-1 basis-[45%] md:basis-auto md:min-w-[130px] shadow-inner transition-transform hover:-translate-y-1 duration-300 ${line.netProfit >= 0 ? 'border-[rgba(16,185,129,0.15)] bg-[var(--color-success-glow)]' : 'border-[rgba(255,59,48,0.15)] bg-[var(--color-danger-glow)]'}`}>
                      <p className="text-[9px] md:text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-widest mb-1">{line.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                      <p className={`text-base md:text-xl font-semibold md:font-bold [filter:var(--shadow-text)] ${line.netProfit >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                        BDT {Math.round(line.netProfit).toLocaleString()}
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
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <Card className="relative bg-[var(--color-bg-card)]/80 backdrop-blur-2xl border-[var(--color-border)] shadow-2xl overflow-hidden p-6">
            <div className="flex items-start gap-5">
              <div className="hidden md:flex bg-[var(--color-primary)]/10 p-3 rounded-xl border border-[var(--color-primary)]/20 text-[var(--color-primary)] shrink-0 shadow-[0_0_15px_rgba(79,140,255,0.2)]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="w-full">
                <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                  System Intelligence
                </h3>
                <ul className="space-y-3 w-full">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0 shadow-[0_0_5px_var(--color-primary)]"></span>
                      <span className="text-sm font-light text-[var(--color-text-main)] leading-relaxed">{insight}</span>
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
      
      {/* Mobile only update status */}
      {!isArchive && (
        <div className="md:hidden mt-8 pb-4 text-center">
          <p className="text-[10px] text-[var(--color-text-muted)] font-light tracking-wide">Last updated data 25 july, 2026</p>
        </div>
      )}

      </div>

      {/* Hidden Printable PDF Component */}
      {isArchive && (
        <PrintableArchiveReport month={month} />
      )}
    </>
  );
}
