"use client";

import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Card } from '@/components/ui/Card';

export function DailyPerformanceChart({ data }) {
  const formattedData = data.map(d => ({
    ...d,
    day: parseInt(d.date.split('-')[2], 10)
  }));

  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0);
  const isLoss = totalProfit < 0;
  const color = isLoss ? "var(--color-danger)" : "var(--color-primary)";

  return (
    <Card className="h-[340px] flex flex-col relative z-20 p-5 border border-[var(--color-border)] bg-[var(--color-bg-card)] rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">
          {isLoss ? "Daily Net Loss" : "Daily Net Profit"}
        </h3>
      </div>
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} opacity={0.6} />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              tickFormatter={(val) => {
                if (val >= 1000 || val <= -1000) return `${Math.round(val/1000)}k`;
                return val;
              }}
            />
            <Tooltip 
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
              itemStyle={{ color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
              formatter={(value) => [`BDT ${value.toLocaleString()}`, isLoss ? "Net Loss" : "Net Profit"]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              name={isLoss ? "Net Loss" : "Net Profit"}
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProfit)"
              activeDot={{ r: 5, fill: color, stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
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
    <Card className="h-[340px] flex flex-col relative z-20 p-5 border border-[var(--color-border)] bg-[var(--color-bg-card)] rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">
          Income vs Cost
        </h3>
      </div>
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} opacity={0.6} />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              tickFormatter={(val) => {
                if (val >= 1000 || val <= -1000) return `${Math.round(val/1000)}k`;
                return val;
              }}
            />
            <Tooltip 
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
              formatter={(value) => `BDT ${value.toLocaleString()}`}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ top: -45, right: 0, fontSize: '10px', fontWeight: '600' }}
            />
            <Area type="monotone" dataKey="income" name="Income" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="cost" name="Cost" stroke="var(--color-warning)" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
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
    <Card className="h-[340px] flex flex-col p-5 border border-[var(--color-border)] bg-[var(--color-bg-card)] rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">Monthly Profit Trend</h3>
      </div>
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} opacity={0.6} />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              stroke="var(--color-border)" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              tickFormatter={(val) => {
                if (val >= 1000 || val <= -1000) return `${Math.round(val/1000)}k`;
                return val;
              }}
            />
            <Tooltip 
              cursor={{fill: 'var(--color-surface)', opacity: 0.5}}
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
              itemStyle={{ color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
              formatter={(value) => `BDT ${value.toLocaleString()}`}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Bar dataKey="profit" name="Profit/Loss" radius={[4, 4, 0, 0]}>
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
