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
          today: null // will store latest day data
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

        if (d.date === latestDate) {
          line.today = d;
        }
      });

      return Object.values(linesMap).map(line => ({
        ...line,
        totalIncome: Math.round(line.totalIncome),
        totalCost: Math.round(line.totalCost),
        netProfit: Math.round(line.netProfit),
        totalProduction: Math.round(line.totalProduction),
        totalWorkers: Math.round(line.totalWorkers),
        totalCm: Math.round(line.totalCm),
        averageWorkers: line.daysActive > 0 ? Math.round(line.totalWorkers / line.daysActive) : 0,
        averageCm: line.daysActive > 0 ? Math.round(line.totalCm / line.daysActive) : 0,
      }));
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

      if (lines.length === 0) return ["No data available to generate insights."];

      // Sort lines by various metrics
      const sortedByProfit = [...lines].sort((a, b) => b.netProfit - a.netProfit);
      const sortedByProduction = [...lines].sort((a, b) => b.totalProduction - a.totalProduction);
      const sortedByCost = [...lines].sort((a, b) => b.totalCost - a.totalCost);
      const sortedByCm = [...lines].sort((a, b) => parseFloat(b.averageCm) - parseFloat(a.averageCm));

      const bestLine = sortedByProfit[0];
      const worstLine = sortedByProfit[sortedByProfit.length - 1];
      const highestProducer = sortedByProduction[0];
      const highestCost = sortedByCost[0];
      const highestCm = sortedByCm[0];

      // 1. Overall Profitability
      if (stats.netProfit > 0) {
        insights.push(`The factory is profitable with a net gain of BDT ${stats.netProfit.toLocaleString()}.`);
      } else if (stats.netProfit < 0) {
        insights.push(`CRITICAL: The factory is operating at a net loss of BDT ${Math.abs(stats.netProfit).toLocaleString()}. Immediate action required.`);
      }

      // 2. Top Performer
      if (bestLine && bestLine.netProfit > 0) {
        const percentage = stats.netProfit > 0 ? ((bestLine.netProfit / stats.netProfit) * 100).toFixed(1) : 0;
        insights.push(`${bestLine.name} is the top performer, generating BDT ${bestLine.netProfit.toLocaleString()} in profit${percentage > 0 ? ` (${percentage}% of total profit)` : ''}.`);
      }

      // 3. Lowest Performer / Losses
      if (worstLine && worstLine.netProfit < 0) {
        insights.push(`${worstLine.name} is operating at a loss of BDT ${Math.abs(worstLine.netProfit).toLocaleString()}, heavily impacting overall margins.`);
      }

      // 4. Production Volume
      if (highestProducer) {
        insights.push(`${highestProducer.name} led production volume with ${highestProducer.totalProduction.toLocaleString()} units manufactured.`);
      }

      // 5. Cost Alert
      if (highestCost) {
        insights.push(`${highestCost.name} incurred the highest operational costs (BDT ${highestCost.totalCost.toLocaleString()}).`);
      }

      // 6. CM (Cost of Making) Insight
      if (highestCm && highestCm.averageCm > 0) {
        insights.push(`${highestCm.name} achieved the highest average CM per dozen at BDT ${highestCm.averageCm}.`);
      }
      
      return insights;
    }
  };
}
