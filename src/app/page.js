"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [range, setRange] = useState('month');
  const [data, setData] = useState({
    totalBalance: 0,
    periodIncome: 0,
    periodExpense: 0,
    momentumData: [],
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard?range=${range}`);
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [range]);

  const rangeLabels = {
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year'
  };

  if (isLoading && data.momentumData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
        <div className="w-full md:w-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
            <h2 className="text-on-surface-variant font-medium">Welcome back, your sanctuary is updated.</h2>
            <div className="flex bg-surface-low p-1 rounded-xl self-start">
              {['day', 'week', 'month', 'year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    range === r 
                      ? 'bg-surface-lowest text-primary shadow-sm' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <h1 className="font-manrope text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Financial Overview</h1>
        </div>
        <Link 
          href="/add-transaction"
          className="rounded-full primary-gradient text-white px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-[0_12px_32px_-4px_rgba(77,68,227,0.3)]"
        >
          <Plus size={20} />
          <span className="font-medium">Add Flow</span>
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 gap-4">
          <p className="text-on-surface-variant font-medium">Total Balance</p>
          <h2 className="font-manrope text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            ₹{data.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 gap-4">
          <div className="flex justify-between items-start">
            <p className="text-on-surface-variant font-medium">Period Earnings</p>
            <div className="w-10 h-10 rounded-full bg-[#e6f4ea] text-secondary flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-manrope text-3xl font-bold text-on-surface mb-1">
              ₹{data.periodIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-sm text-secondary font-medium">{rangeLabels[range]}</p>
          </div>
        </div>

        <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 gap-4">
          <div className="flex justify-between items-start">
            <p className="text-on-surface-variant font-medium">Period Spending</p>
            <div className="w-10 h-10 rounded-full bg-[#fde9ee] text-tertiary flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-manrope text-3xl font-bold text-on-surface mb-1">
              ₹{data.periodExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-sm text-on-surface-variant">{rangeLabels[range]}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-manrope text-xl font-bold text-on-surface">Financial Momentum</h3>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
            <div className="h-64 min-h-[16rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.momentumData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3525cd" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#464555', fontSize: 10}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 12px 32px -4px rgba(77, 68, 227, 0.12)' }}
                    cursor={{stroke: '#3525cd', strokeWidth: 1, strokeDasharray: '4 4'}}
                    formatter={(value) => [`₹${value.toLocaleString()}`, "Balance"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3525cd" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-surface-low rounded-3xl p-6">
            <h3 className="font-manrope text-xl font-bold text-on-surface mb-6">Recent Flows</h3>
            <div className="flex flex-col gap-4">
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((tax) => (
                  <div key={tax.id} className="bg-surface-lowest p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform duration-200 cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tax.type === 'income' ? 'bg-[#e6f4ea] text-secondary' : 'bg-surface-low text-on-surface-variant'}`}>
                        {tax.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm sm:text-base">{tax.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{tax.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tax.type === 'income' ? 'text-secondary' : 'text-on-surface'} text-sm sm:text-base`}>{tax.amount}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{tax.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-center py-8">No flows found for this period.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

