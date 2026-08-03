"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const MonthContext = createContext();

export function MonthProvider({ children }) {
  const searchParams = useSearchParams();
  const initialMonth = searchParams.get('month') || 'live';
  
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  useEffect(() => {
    const urlMonth = searchParams.get('month');
    if (urlMonth && urlMonth !== selectedMonth) {
      setSelectedMonth(urlMonth);
    }
  }, [searchParams]);

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
