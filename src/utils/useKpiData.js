"use client";

import { useState, useEffect } from 'react';
import { createKpiEngine } from './kpiEngine';
import { useMonth } from '@/components/providers/MonthProvider';

const dataCache = {};
const fetchPromises = {};

export function useKpiData() {
  const { selectedMonth } = useMonth();
  const [data, setData] = useState(dataCache[selectedMonth] || null);
  const [loading, setLoading] = useState(!dataCache[selectedMonth]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (dataCache[selectedMonth]) {
        if (isMounted) {
          setData(dataCache[selectedMonth]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        if (!fetchPromises[selectedMonth]) {
          fetchPromises[selectedMonth] = fetch(`/api/data?month=${selectedMonth}`).then(res => {
            if (!res.ok) throw new Error('Failed to fetch data');
            return res.json();
          });
        }
        
        const rawData = await fetchPromises[selectedMonth];
        
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

        dataCache[selectedMonth] = processedData;

        if (isMounted) {
          setData(processedData);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  return { ...data, loading, error };
}
