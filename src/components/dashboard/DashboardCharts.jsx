"use client";

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Card } from '@/components/ui/Card';

export function DailyPerformanceChart({ data }) {
  // data is [{ date: '2026-07-01', profit: -26500, ... }]
  const formattedData = data.map(d => ({
    ...d,
    day: parseInt(d.date.split('-')[2], 10)
  }));

  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0);
  const isLoss = totalProfit < 0;

  return (
    <Card className="h-96 flex flex-col relative z-20">
      <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-widest mb-6">
        {isLoss ? "Daily Net Loss" : "Daily Net Profit"}
      </h3>
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
            <YAxis width={100} stroke="var(--color-text-muted)" tickLine={false} axisLine={false} tickFormatter={(val) => `BDT ${Math.round(val).toLocaleString()}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-bg-card)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name={isLoss ? "Net Loss" : "Net Profit"}
              stroke={isLoss ? "var(--color-danger)" : "var(--color-primary)"} 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8, fill: isLoss ? "var(--color-danger)" : "var(--color-primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function IncomeVsCostChart({ data }) {
  const formattedData = data.map(d => ({
    ...d,
    day: parseInt(d.date.split('-')[2], 10)
  }));

  return (
    <Card className="h-96 flex flex-col relative z-20">
      <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-widest mb-6">Income vs Cost</h3>
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
            <YAxis width={100} stroke="var(--color-text-muted)" tickLine={false} axisLine={false} tickFormatter={(val) => `${Math.round(val).toLocaleString()}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-bg-card)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Line type="monotone" dataKey="income" name="Income" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="cost" name="Cost" stroke="var(--color-warning)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function MonthlyProfitBarChart({ data }) {
  const formattedData = data.map(d => ({
    ...d,
    day: parseInt(d.date.split('-')[2], 10)
  }));

  return (
    <Card className="h-96 flex flex-col">
      <h3 className="text-lg font-normal mb-6">Monthly Profit Trend</h3>
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
            <YAxis width={100} stroke="var(--color-text-muted)" tickLine={false} axisLine={false} tickFormatter={(val) => `${Math.round(val).toLocaleString()}`} />
            <Tooltip 
              cursor={{fill: 'var(--color-surface)'}}
              contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
              itemStyle={{ color: 'var(--color-text-main)' }}
              labelStyle={{ color: 'var(--color-text-main)', marginBottom: '4px' }}
            />
            <Bar dataKey="profit" name="Profit/Loss">
              {
                formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
