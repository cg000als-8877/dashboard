"use client";

import { useState, useEffect } from 'react';
import { createKpiEngine } from './kpiEngine';
import { useMonth } from '@/components/providers/MonthProvider';

const dataCache = {};
const fetchPromises = {};

export function useKpiData(monthOverride) {
  const { selectedMonth } = useMonth();
  const targetMonth = monthOverride || selectedMonth;
  const [data, setData] = useState(dataCache[targetMonth] || null);
  const [loading, setLoading] = useState(!dataCache[targetMonth]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (dataCache[targetMonth]) {
        if (isMounted) {
          setData(dataCache[targetMonth]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        if (!fetchPromises[targetMonth]) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          fetchPromises[targetMonth] = fetch(`/api/data?month=${targetMonth}`, { signal: controller.signal })
            .then(res => {
              clearTimeout(timeoutId);
              if (!res.ok) throw new Error('Failed to fetch data');
              return res.json();
            })
            .catch(err => {
              clearTimeout(timeoutId);
              delete fetchPromises[targetMonth];
              throw err;
            });
        }
        
        const rawData = await fetchPromises[targetMonth];
        
        if (!rawData.dailyProduction || !rawData.lines) {
          throw new Error('Invalid data format received from API');
        }

        const engine = createKpiEngine(rawData);
        const processedData = {
          stats: engine.getOverallStats(),
          dailyTrends: engine.getDailyTrends(),
          insights: engine.getInsights(),
          lines: engine.getLinePerformance(),
          rawEngine: engine
        };

        dataCache[targetMonth] = processedData;

        if (isMounted) {
          setData(processedData);
        }
      } catch (err) {
        console.error(err);
        delete fetchPromises[targetMonth];
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [targetMonth]);

  return { ...data, loading, error };
}
