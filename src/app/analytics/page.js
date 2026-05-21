"use client";

import { 
  TrendingDown, 
  Coffee,
  PiggyBank,
  RefreshCw,
  Target,
  Loader2,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function AnalyticsInsights() {
  const { data, isLoading } = useSWR('/api/analytics', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  const analyticsData = data || {
    trends: [],
    allocation: [],
    insights: [],
    forecast: { title: "Calculating...", message: "Hang tight while we curate your financial path." }
  };

  if (isLoading && analyticsData.trends.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const hasData = analyticsData.trends.length > 0 && analyticsData.trends.some(t => t.value > 0);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-24">
      <header className="mb-12">
        <h2 className="text-on-surface-variant mb-1">Your financial momentum at a glance. We've curated these insights to help you grow your wealth intentionally.</h2>
        <h1 className="font-manrope text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Intelligence Hub</h1>
      </header>

      {!hasData ? (
        <div className="bg-surface-lowest p-12 rounded-[2.5rem] text-center border-2 border-dashed border-surface-low mb-12">
           <h3 className="text-xl font-bold text-on-surface mb-2">Not enough data yet</h3>
           <p className="text-on-surface-variant">Start adding transactions to see your financial momentum patterns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col gap-6">
            <div>
              <h3 className="font-manrope text-xl font-bold text-on-surface mb-2">Spending Trends</h3>
              <div className="flex items-center gap-2 text-secondary font-medium">
                <TrendingUp size={18} />
                <span>Active trajectory tracking</span>
              </div>
            </div>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.trends}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3525cd" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#464555', fontSize: 12}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 12px 32px -4px rgba(77, 68, 227, 0.12)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3525cd" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col gap-6">
            <h3 className="font-manrope text-xl font-bold text-on-surface">Allocation (%)</h3>
            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 12px 32px -4px rgba(77, 68, 227, 0.12)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-3xl font-manrope font-bold text-on-surface">100%</span>
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Allocated</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              {analyticsData.allocation.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-on-surface-variant">{item.name} ({item.value.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {analyticsData.insights.length > 0 ? analyticsData.insights.map((insight, idx) => (
          <div key={idx} className="bg-surface-lowest p-6 rounded-3xl ghost-shadow border-t-4 border-primary">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              {insight.type === 'alert' ? <TrendingDown size={24} /> : <PiggyBank size={24} />}
            </div>
            <h4 className="font-bold text-lg text-on-surface mb-2">{insight.title}</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {insight.description}
            </p>
          </div>
        )) : (
          <>
            <div className="bg-surface-lowest p-6 rounded-3xl ghost-shadow border-t-4 border-tertiary">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
                <Coffee size={24} />
              </div>
              <h4 className="font-bold text-lg text-on-surface mb-2">Caffeine Spike</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Add more transactions to unlock category-specific spending alerts.
              </p>
            </div>
            <div className="bg-surface-lowest p-6 rounded-3xl ghost-shadow border-t-4 border-secondary">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <PiggyBank size={24} />
              </div>
              <h4 className="font-bold text-lg text-on-surface mb-2">Saving Momentum</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Your savings rate will appear here as you log income and expenses.
              </p>
            </div>
            <div className="bg-surface-lowest p-6 rounded-3xl ghost-shadow border-t-4 border-on-surface-variant">
              <div className="w-12 h-12 rounded-full bg-surface-low text-on-surface-variant flex items-center justify-center mb-4">
                <RefreshCw size={24} />
              </div>
              <h4 className="font-bold text-lg text-on-surface mb-2">Recurring Audit</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                 We'll scan for duplicate or high-cost subscriptions automatically.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between border border-primary/10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Target size={24} />
            <h3 className="font-manrope text-xl font-bold">{analyticsData.forecast.title}</h3>
          </div>
          <p className="text-on-surface text-lg leading-relaxed font-medium max-w-3xl">
            {analyticsData.forecast.message}
          </p>
        </div>
      </div>

      <p className="text-center text-sm font-medium text-on-surface-variant mt-12 tracking-wide uppercase">
        Crafted by The Kinetic Ledger • Precision in Motion
      </p>
    </div>
  );
}
