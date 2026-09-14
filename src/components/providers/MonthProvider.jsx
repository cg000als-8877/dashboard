"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const MonthContext = createContext();

export function MonthProvider({ children }) {
  const [selectedMonth, setSelectedMonth] = useState('live');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMonth = params.get('month');
      if (urlMonth && urlMonth !== selectedMonth) {
        setSelectedMonth(urlMonth);
      }
    } catch (e) {}
  }, []);

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
