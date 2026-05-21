"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Filter,
  Lightbulb,
  MessageCircleQuestion,
  Loader2,
  Trash2
} from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function Transactions() {
  const { mutate } = useSWRConfig();
  const [range, setRange] = useState('all');
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);

  // SWR Infinite key generator
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    
    const url = new URL(`${window.location.origin}/api/transactions`);
    url.searchParams.set('search', search);
    url.searchParams.set('range', range);
    url.searchParams.set('take', '10');
    if (pageIndex > 0 && previousPageData.nextCursor) {
      url.searchParams.set('cursor', previousPageData.nextCursor);
    }
    return url.toString();
  };

  const { data: infiniteData, size, setSize, isLoading: isLoadingTrx, isValidating: isValidatingTrx } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const { data: insights = [] } = useSWR('/api/insights', fetcher);

  const transactions = infiniteData ? infiniteData.flatMap(page => page.transactions) : [];
  const nextCursor = infiniteData?.[infiniteData.length - 1]?.nextCursor;
  const isLoadingMore = isLoadingTrx || (size > 0 && infiniteData && typeof infiniteData[size - 1] === "undefined");

  const handleLoadMore = () => {
    if (nextCursor) {
      setSize(size + 1);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this flow? This action is irreversible.")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        mutate(getKey);
        mutate('/api/insights');
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const rangeLabels = {
    all: 'All Time',
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year'
  };

  const topInsight = insights.find(i => i.type === 'alert' || i.type === 'win') || {
      title: "Automated Insight",
      description: "Keep tracking your spending to see automated insights here.",
      type: "info"
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="w-full md:w-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h2 className="text-on-surface-variant font-medium">Review and manage your financial momentum.</h2>
            <div className="flex bg-surface-low p-1 rounded-xl self-start">
              {['all', 'day', 'week', 'month', 'year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                    range === r 
                      ? 'bg-surface-lowest text-primary shadow-sm' 
                      : 'text-on-surface-variant/60 hover:text-on-surface'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <h1 className="font-manrope text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Transactions</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-lowest rounded-full py-3.5 pl-12 pr-4 outline-none border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium ghost-shadow"
              />
            </div>
            <button className="bg-surface-lowest p-3.5 rounded-full ghost-shadow text-on-surface-variant hover:text-primary transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <div className="bg-surface-lowest rounded-3xl ghost-shadow p-6 relative min-h-[400px]">
            {(isLoadingTrx && transactions.length === 0) && (
               <div className="absolute inset-0 bg-surface-lowest/50 flex items-center justify-center z-10 rounded-3xl backdrop-blur-[2px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            )}
            
            <div className="flex flex-col gap-5">
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <div key={trx.id} className="relative group">
                    <div className="bg-surface p-4 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-lg border border-transparent hover:border-surface-low group/item">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110 ${trx.type === 'income' ? 'bg-[#e6f4ea] text-secondary' : 'bg-surface-low text-on-surface-variant'}`}>
                          {trx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-base">{trx.name}</p>
                          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{trx.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`font-bold ${trx.type === 'income' ? 'text-secondary' : 'text-on-surface'} text-base`}>{trx.amount}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">{trx.date} • {trx.time}</p>
                        </div>
                        <button 
                          onClick={() => handleDelete(trx.id)}
                          disabled={isDeleting === trx.id}
                          className="p-2.5 text-on-surface-variant/40 hover:text-tertiary hover:bg-tertiary/10 rounded-xl transition-all md:opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        >
                          {isDeleting === trx.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !isLoadingTrx && (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
                    <Search size={48} />
                    <p className="text-on-surface-variant font-medium uppercase tracking-widest text-xs">No transactions discovered in this sector</p>
                  </div>
                )
              )}
            </div>
            
            {nextCursor && (
              <div className="mt-12 flex justify-center">
                <button 
                   onClick={handleLoadMore}
                   disabled={isLoadingMore}
                   className="px-8 py-3.5 rounded-full bg-surface-low text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Decrypting more flows...
                    </>
                  ) : "Load older activity"}
                </button>
              </div>
            )}
          </div>
        </section>



        <section className="flex flex-col gap-6">
          <div className="bg-surface-lowest rounded-3xl ghost-shadow p-8 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0"></div>
            <div className="flex items-center gap-3 relative z-10 text-primary mb-2">
              <Lightbulb size={24} />
              <h3 className="font-manrope text-xl font-bold">{topInsight.title}</h3>
            </div>
            <p className="text-on-surface text-lg font-medium leading-relaxed relative z-10" dangerouslySetInnerHTML={{ __html: topInsight.description }}>
            </p>
          </div>

          <div className="bg-surface-lowest rounded-3xl ghost-shadow p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-on-surface mb-2">
              <MessageCircleQuestion size={24} />
              <h3 className="font-manrope text-xl font-bold">Quick Support</h3>
            </div>
            <p className="text-on-surface-variant font-medium">
              Dispute a charge or request a summary in seconds.
            </p>
            <button className="mt-4 py-3 px-6 rounded-full border-2 border-surface-low text-primary font-semibold hover:border-primary/20 transition-colors w-max">
              Contact Support
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
