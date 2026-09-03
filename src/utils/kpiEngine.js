export function createKpiEngine(rawData) {
  // Helper to filter out NO_PRODUCTION / HOLIDAY unless we specifically need them
  const activeProduction = rawData.dailyProduction.filter(d => d.status === 'ACTIVE');

  return {
    kpiData: rawData,
    // Aggregate everything
    getOverallStats() {
      let totalCost = 0;
      let totalIncome = 0;
      let totalProduction = 0;
      const workingDaysSet = new Set();
      const activeLinesSet = new Set();

      activeProduction.forEach(d => {
        totalCost += d.total_cost || 0;
        totalIncome += d.total_income || 0;
        totalProduction += d.production_qty || 0;
        workingDaysSet.add(d.date);
        activeLinesSet.add(d.line_id);
      });

      const netProfit = totalIncome - totalCost;
      const workingDays = workingDaysSet.size;
      const averageDailyProfit = workingDays > 0 ? netProfit / workingDays : 0;

      return {
        totalCost: Math.round(totalCost),
        totalIncome: Math.round(totalIncome),
        netProfit: Math.round(netProfit),
        workingDays,
        activeLinesCount: activeLinesSet.size,
        totalLinesCount: rawData.lines?.length || 4,
        averageDailyProfit: Math.round(averageDailyProfit),
        totalProduction: Math.round(totalProduction)
      };
    },

    getLinePerformance() {
      const linesMap = {};
      
      // Initialize maps
      rawData.lines.forEach(l => {
        linesMap[l.id] = {
          id: l.id,
          name: l.name,
          totalIncome: 0,
          totalCost: 0,
          netProfit: 0,
          totalProduction: 0,
          totalWorkers: 0, // average per day
          daysActive: 0,
          averageCm: 0,
          totalCm: 0,
          today: null, // will store latest day data
          itemsSet: new Set()
        };
      });

      // We assume data is sorted chronologically in excel, so the last entry is 'today'
      const sortedData = [...activeProduction].sort((a, b) => a.date.localeCompare(b.date));
      const latestDate = sortedData.length > 0 ? sortedData[sortedData.length - 1].date : null;

      sortedData.forEach(d => {
        const line = linesMap[d.line_id];
        if (!line) return;

        line.totalIncome += d.total_income || 0;
        line.totalCost += d.total_cost || 0;
        line.netProfit = line.totalIncome - line.totalCost;
        line.totalProduction += d.production_qty || 0;
        line.totalWorkers += d.worker_count || 0;
        line.totalCm += d.cm_per_dzn || 0;
        line.daysActive++;

        if (d.item && typeof d.item === 'string' && d.item.trim() !== '') {
          const splitItems = d.item.split(/[,/&]+/).map(s => s.trim()).filter(Boolean);
          if (splitItems.length > 0) {
            splitItems.forEach(it => line.itemsSet.add(it));
          } else {
            line.itemsSet.add(d.item.trim());
          }
        }

        if (d.production_qty !== undefined && d.production_qty !== null && d.status !== 'HOLIDAY') {
          line.lastActiveDay = d;
        }

        if (d.date === latestDate) {
          line.today = d;
        }
      });

      return Object.values(linesMap).map(line => {
        const uniqueItems = Array.from(line.itemsSet);
        const runningItem = line.lastActiveDay?.item || line.today?.item || (uniqueItems.length > 0 ? uniqueItems[uniqueItems.length - 1] : null);
        const itemLabel = runningItem || (uniqueItems.length > 0
          ? uniqueItems.join(', ')
          : (
              line.name.includes('A') ? 'Sherpa Jacket' :
              line.name.includes('B') ? 'Boxer' :
              line.name.includes('C') ? 'Boxer' :
              line.name.includes('D') ? "Men's Tshirt" : 'Unknown'
            ));

        const lastDay = line.lastActiveDay || line.today || null;
        const lastDayOutput = lastDay ? Math.round(lastDay.production_qty || 0) : 0;
        const lastDayIncome = lastDay ? Math.round(lastDay.total_income || 0) : 0;
        const lastDayCost = lastDay ? Math.round(lastDay.total_cost || 0) : 0;
        const lastDayProfit = lastDay ? Math.round(lastDay.net_profit !== undefined ? lastDay.net_profit : (lastDayIncome - lastDayCost)) : 0;
        const lastDayCostRecovery = lastDayCost > 0 ? ((lastDayIncome / lastDayCost) * 100).toFixed(1) : '0.0';
        const monthCostRecovery = line.totalCost > 0 ? ((line.totalIncome / line.totalCost) * 100).toFixed(1) : '0.0';

        return {
          ...line,
          items: uniqueItems,
          item: itemLabel,
          totalIncome: Math.round(line.totalIncome),
          totalCost: Math.round(line.totalCost),
          netProfit: Math.round(line.netProfit),
          totalProduction: Math.round(line.totalProduction),
          totalWorkers: Math.round(line.totalWorkers),
          totalCm: Math.round(line.totalCm),
          averageWorkers: line.daysActive > 0 ? Math.round(line.totalWorkers / line.daysActive) : 0,
          averageCm: line.daysActive > 0 ? Math.round(line.totalCm / line.daysActive) : 0,
          monthCostRecovery,
          lastDay,
          lastDayDate: lastDay?.date || null,
          lastDayOutput,
          lastDayIncome,
          lastDayCost,
          lastDayProfit,
          lastDayCostRecovery
        };
      });
    },

    getDailyTrends() {
      const dailyMap = {};
      activeProduction.forEach(d => {
        if (!dailyMap[d.date]) {
          dailyMap[d.date] = { date: d.date, income: 0, cost: 0, profit: 0, production: 0 };
        }
        dailyMap[d.date].income += d.total_income || 0;
        dailyMap[d.date].cost += d.total_cost || 0;
        dailyMap[d.date].profit += d.net_profit || 0;
        dailyMap[d.date].production += d.production_qty || 0;
      });

      return Object.values(dailyMap)
        .map(d => ({
          ...d,
          income: Math.round(d.income),
          cost: Math.round(d.cost),
          profit: Math.round(d.profit),
          production: Math.round(d.production)
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    
    getInsights() {
      const stats = this.getOverallStats();
      const lines = this.getLinePerformance();
      
      const insights = [];

      if (lines.length === 0) return ["No operational data available to generate system intelligence."];

      // Sort lines by various metrics
      const sortedByProfit = [...lines].sort((a, b) => b.netProfit - a.netProfit);
      const sortedByProduction = [...lines].sort((a, b) => b.totalProduction - a.totalProduction);
      const sortedByCost = [...lines].sort((a, b) => b.totalCost - a.totalCost);
      const sortedByCm = [...lines].sort((a, b) => parseFloat(b.averageCm || 0) - parseFloat(a.averageCm || 0));
      const sortedByRecovery = [...lines].sort((a, b) => parseFloat(b.monthCostRecovery || 0) - parseFloat(a.monthCostRecovery || 0));

      const bestLine = sortedByProfit[0];
      const worstLine = sortedByProfit[sortedByProfit.length - 1];
      const highestProducer = sortedByProduction[0];
      const highestCostLine = sortedByCost[0];
      const highestCm = sortedByCm[0];
      const lowestCm = sortedByCm[sortedByCm.length - 1];
      const highestRecoveryLine = sortedByRecovery[0];
      const lowestRecoveryLine = sortedByRecovery[sortedByRecovery.length - 1];

      const overallCostRecovery = stats.totalCost > 0 ? ((stats.totalIncome / stats.totalCost) * 100).toFixed(1) : '0.0';
      const volShare = stats.totalProduction > 0 && highestProducer ? Math.round((highestProducer.totalProduction / stats.totalProduction) * 100) : 0;
      const costShare = stats.totalCost > 0 && highestCostLine ? Math.round((highestCostLine.totalCost / stats.totalCost) * 100) : 0;
      
      // Calculate latest active day totals across lines
      let lastDayTotalOutput = 0;
      let lastDayTotalIncome = 0;
      let lastDayTotalCost = 0;
      let lastActiveDate = null;
      lines.forEach(l => {
        lastDayTotalOutput += (l.lastDayOutput || 0);
        lastDayTotalIncome += (l.lastDayIncome || 0);
        lastDayTotalCost += (l.lastDayCost || 0);
        if (l.lastDayDate && !lastActiveDate) lastActiveDate = l.lastDayDate;
      });

      // Breakeven production estimation
      const avgIncomePerPcs = stats.totalProduction > 0 ? (stats.totalIncome / stats.totalProduction) : 0;
      const breakevenSurgeQty = avgIncomePerPcs > 0 && stats.netProfit < 0 ? Math.round(Math.abs(stats.netProfit) / (stats.workingDays || 1) / avgIncomePerPcs) : 0;
      const breakevenPct = stats.totalIncome > 0 && stats.totalCost > 0 ? Math.round(((stats.totalCost - stats.totalIncome) / stats.totalIncome) * 100) : 0;

      // 1. Overall Financial Status & Deficit
      if (stats.netProfit < 0) {
        insights.push(`<strong>CRITICAL LOSS ALERT:</strong> Factory operating at a net loss of <span class="text-rose-400 font-bold">BDT ${Math.abs(stats.netProfit).toLocaleString()}</span>, with total revenue of <span class="text-[var(--color-primary)] font-bold">BDT ${stats.totalIncome.toLocaleString()}</span> unrecovered against <span class="text-amber-400 font-bold">BDT ${stats.totalCost.toLocaleString()}</span> in expenses.`);
      } else {
        insights.push(`<strong>FINANCIAL SURPLUS:</strong> Factory generating net profit of <span class="text-emerald-400 font-bold">+BDT ${stats.netProfit.toLocaleString()}</span> with total revenue of <span class="text-[var(--color-primary)] font-bold">BDT ${stats.totalIncome.toLocaleString()}</span> surpassing operational expenditure.`);
      }

      // 2. Daily Run-Rate & Cash Burn
      if (stats.averageDailyProfit < 0) {
        insights.push(`<strong>DAILY CASH BURN:</strong> Current burn run-rate is <span class="text-rose-400 font-bold">-BDT ${Math.abs(stats.averageDailyProfit).toLocaleString()} / day</span> across <span class="text-[var(--color-primary)] font-bold">${stats.workingDays} active production day(s)</span>.`);
      } else {
        insights.push(`<strong>DAILY PROFIT RUN-RATE:</strong> Operating with an average daily profit of <span class="text-emerald-400 font-bold">+BDT ${stats.averageDailyProfit.toLocaleString()} / day</span> across <span class="text-[var(--color-primary)] font-bold">${stats.workingDays} active day(s)</span>.`);
      }

      // 3. Factory-Wide Cost Recovery Shortfall
      insights.push(`<strong>COST RECOVERY GAP:</strong> Overall factory cost recovery stands at <span class="text-amber-400 font-bold">${overallCostRecovery}%</span>, leaving a <span class="text-rose-400 font-bold">${Math.max(0, (100 - parseFloat(overallCostRecovery))).toFixed(1)}% recovery deficit</span> to reach zero-loss breakeven.`);

      // 4. Volume Leadership
      if (highestProducer) {
        insights.push(`<strong>VOLUME LEADERSHIP:</strong> <span class="text-[var(--color-primary)] font-bold">${highestProducer.name}</span> (${highestProducer.item || 'Active'}) leads factory output with <span class="text-emerald-400 font-bold">${highestProducer.totalProduction.toLocaleString()} PCS</span> manufactured (${volShare}% of total output).`);
      }

      // 5. Major Deficit / Loss Contributor
      if (worstLine && worstLine.netProfit < 0) {
        insights.push(`<strong>HIGHEST DEFICIT CONTRIBUTOR:</strong> <span class="text-rose-400 font-bold">${worstLine.name}</span> (${worstLine.item || 'Active'}) accounts for the largest deficit at <span class="text-rose-400 font-bold">-BDT ${Math.abs(worstLine.netProfit).toLocaleString()}</span> with <span class="text-amber-400 font-bold">${worstLine.monthCostRecovery || '0.0'}% cost recovery</span>.`);
      }

      // 6. Expenditure & Overhead Concentration
      if (highestCostLine) {
        insights.push(`<strong>OVERHEAD CONCENTRATION:</strong> <span class="text-[var(--color-primary)] font-bold">${highestCostLine.name}</span> incurred highest operational cost of <span class="text-amber-400 font-bold">BDT ${highestCostLine.totalCost.toLocaleString()}</span> (${costShare}% of factory total).`);
      }

      // 7. CM Rate Spread & Pricing Yield
      if (highestCm && highestCm.averageCm > 0) {
        insights.push(`<strong>CM REVENUE SPREAD:</strong> Highest earning style is on <span class="text-[var(--color-primary)] font-bold">${highestCm.name}</span> at <span class="text-emerald-400 font-bold">BDT ${highestCm.averageCm}/Dzn</span>, compared to <span class="text-amber-400 font-bold">BDT ${lowestCm?.averageCm || '250'}/Dzn</span> on baseline styles.`);
      }

      // 8. Line Efficiency Disparity
      if (highestRecoveryLine && lowestRecoveryLine) {
        insights.push(`<strong>LINE EFFICIENCY SPREAD:</strong> Line recovery rates range from <span class="text-rose-400 font-bold">${lowestRecoveryLine.monthCostRecovery || '0.0'}% (${lowestRecoveryLine.name})</span> to <span class="text-emerald-400 font-bold">${highestRecoveryLine.monthCostRecovery || '0.0'}% (${highestRecoveryLine.name})</span>, requiring floor re-balancing.`);
      }

      // 9. Latest Production Day Telemetry
      if (lastDayTotalOutput > 0) {
        insights.push(`<strong>LATEST DAY PRODUCTION:</strong> Across active lines, latest daily output reached <span class="text-[var(--color-primary)] font-bold">${lastDayTotalOutput.toLocaleString()} PCS</span> generating <span class="text-emerald-400 font-bold">BDT ${lastDayTotalIncome.toLocaleString()}</span> against <span class="text-amber-400 font-bold">BDT ${lastDayTotalCost.toLocaleString()}</span> cost.`);
      }

      // 10. Breakeven Production Surge Target
      if (breakevenSurgeQty > 0) {
        insights.push(`<strong>BREAKEVEN OUTPUT TARGET:</strong> To fully offset daily loss at current CM rates, daily output must increase by <span class="text-emerald-400 font-bold">+${breakevenSurgeQty.toLocaleString()} PCS/day</span> (+${breakevenPct}% revenue surge).`);
      }

      // 11. Active Line Capacity
      const activeRunningItems = lines.filter(l => (l.totalProduction || 0) > 0).map(l => `${l.name} (${l.item || 'N/A'})`).join(', ');
      insights.push(`<strong>ACTIVE LINE CAPACITY:</strong> <span class="text-[var(--color-primary)] font-bold">${stats.activeLinesCount} of ${stats.totalLinesCount || 4} lines</span> actively logged production: <span class="text-[var(--color-text-secondary)] font-semibold">${activeRunningItems || 'All Lines'}</span>.`);

      // 12. Strategic Executive Directive
      insights.push(`<strong>STRATEGIC DIRECTIVE:</strong> Prioritize production acceleration on high-CM styles while right-sizing manpower allocation on high-deficit lines to eliminate unrecovered labor burn.`);

      return insights;
    }
  };
}
