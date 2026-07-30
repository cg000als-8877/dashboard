"use client";

import { useState, useEffect } from 'react';
import { createKpiEngine } from './kpiEngine';

export function useKpiData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const rawData = await res.json();
        
        // Ensure rawData matches the expected structure
        if (!rawData.dailyProduction || !rawData.lines) {
          throw new Error('Invalid data format received from API');
        }

        const engine = createKpiEngine(rawData);
        
        setData({
          stats: engine.getOverallStats(),
          dailyTrends: engine.getDailyTrends(),
          insights: engine.getInsights(),
          lines: engine.getLinePerformance(),
          rawEngine: engine
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { ...data, loading, error };
}
