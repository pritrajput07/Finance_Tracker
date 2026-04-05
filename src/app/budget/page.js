"use client";

import { useState, useEffect } from "react";
import { 
  Wallet,
  AlertTriangle,
  TrendingDown,
  Loader2,
  Plus,
  X,
  Target,
  Pencil,
  Trash2
} from "lucide-react";
import clsx from "clsx";

export default function Budget() {
  const [range, setRange] = useState('month');
  const [data, setData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    categoryAllocations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ id: null, categoryId: '', amountLimit: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/budgets?range=${range}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, [range]);

  const rangeLabels = {
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year'
  };

  const handleEdit = (cat) => {
    const category = categories.find(c => c.name === cat.name);
    setFormData({
      id: cat.id,
      categoryId: category?.id || '',
      amountLimit: cat.total.toString()
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this budget? This will remove the tracking limit for this category.")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchBudgets();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchBudgets();
        setIsPanelOpen(false);
        setFormData({ id: null, categoryId: '', amountLimit: '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && data.categoryAllocations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-24">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="w-full md:w-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <h2 className="text-on-surface-variant font-medium">Financial Sanctuary</h2>
              <div className="flex bg-surface-low p-1 rounded-xl self-start backdrop-blur-md">
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
            <h1 className="font-manrope text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Budget Planning</h1>
          </div>
          <button 
            onClick={() => {
              setFormData({ id: null, categoryId: '', amountLimit: '' });
              setIsPanelOpen(true);
            }}
            className="rounded-full primary-gradient text-white px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-[0_12px_32px_-4px_rgba(77,68,227,0.3)] group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium text-sm">New Allocation</span>
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 gap-4">
            <div className="flex justify-between items-center">
              <p className="text-on-surface-variant font-medium">Total Budgeted</p>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            <h2 className="font-manrope text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              ₹{data.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h2>
          </div>
          
          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 gap-4">
            <p className="text-on-surface-variant font-medium">Spent {rangeLabels[range]}</p>
            <h2 className="font-manrope text-4xl font-bold text-on-surface tracking-tight">
               ₹{data.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h2>
          </div>

          <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 gap-4 border-b-4 border-primary">
            <p className="text-on-surface-variant font-medium">Available Flux</p>
            <h2 className="font-manrope text-4xl font-bold text-primary tracking-tight">
              ₹{data.remaining.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h2>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-surface-lowest p-8 rounded-3xl ghost-shadow">
              <div className="flex justify-between items-center mb-8 px-2">
                <h3 className="font-manrope text-xl font-bold text-on-surface">Category Allocation</h3>
                <span className="text-xs font-medium text-on-surface-variant py-1.5 px-3 bg-surface-low rounded-full">{data.categoryAllocations.length} Active</span>
              </div>
              <div className="flex flex-col gap-8 px-2">
                {data.categoryAllocations.map((cat, idx) => {
                  const percent = Math.min((cat.spent / cat.total) * 100, 100);
                  const isCritical = percent > 90;
                  
                  return (
                    <div key={idx} className="flex flex-col gap-3 group/row p-1 rounded-2xl hover:bg-surface-low/30 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-on-surface text-lg font-bold tracking-tight">{cat.name}</span>
                          <span className={clsx("text-xs font-medium", isCritical ? "text-tertiary" : "text-on-surface-variant opacity-60")}>
                            {isCritical ? "Critical Status" : "Optimal Flow"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <span className={clsx("text-base font-bold", isCritical ? "text-tertiary" : "text-on-surface")}>₹{cat.spent.toLocaleString()}</span>
                              <span className="text-on-surface-variant/40 text-xs font-medium ml-1">/ ₹{cat.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                               <button 
                                 onClick={() => handleEdit(cat)}
                                 className="p-2 bg-surface-lowest text-on-surface-variant hover:text-primary rounded-xl shadow-sm transition-all active:scale-90"
                               >
                                 <Pencil size={15} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(cat.id)}
                                 disabled={isDeleting === cat.id}
                                 className="p-2 bg-surface-lowest text-on-surface-variant hover:text-tertiary rounded-xl shadow-sm transition-all active:scale-90"
                               >
                                 {isDeleting === cat.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                               </button>
                            </div>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-surface-low rounded-full overflow-hidden p-[2px]">
                        <div 
                          className={clsx("h-full rounded-full transition-all duration-1000 ease-out relative group/bar")}
                          style={{ width: `${percent}%`, backgroundColor: isCritical ? undefined : cat.color }}
                        >
                           {isCritical && <div className="absolute inset-0 bg-tertiary animate-pulse opacity-50 rounded-full" />}
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{Math.round(percent)}% UTILIZED</span>
                      </div>
                    </div>
                  );
                })}
                {data.categoryAllocations.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
                    <Target size={48} />
                    <p className="text-on-surface-variant font-medium">No budgets configured. Set goals to track your growth.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="font-manrope text-xl font-bold text-on-surface pl-2">System Signals</h3>
            
            <div className="bg-surface-lowest rounded-3xl ghost-shadow p-6 relative overflow-hidden border-l-4 border-tertiary hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 text-tertiary mb-3">
                <AlertTriangle size={20} />
                <h4 className="font-bold text-base">Entropy Warning</h4>
              </div>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                Aggressive expenditure detected in high-risk categories. Recalculate your trajectory.
              </p>
            </div>

            <div className="bg-surface-lowest rounded-3xl ghost-shadow p-6 relative overflow-hidden border-l-4 border-secondary hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 text-secondary mb-3">
                <TrendingDown size={20} />
                <h4 className="font-bold text-base">Efficiency Milestone</h4>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">
                You have optimized flow in {data.categoryAllocations.filter(c => (c.spent/c.total) < 0.5).length} sectors.
              </p>
            </div>
            
            <div className="bg-primary/5 rounded-3xl ghost-shadow p-6 relative overflow-hidden flex flex-col justify-center border border-primary/10">
               <div className="flex items-center gap-3 text-primary mb-3">
                <Wallet size={20} />
                <h4 className="font-bold text-base">Reserve Build</h4>
              </div>
              <p className="text-sm font-medium text-on-surface-variant/60 mb-2">Projected Flux Retention</p>
              <p className="font-manrope text-3xl font-bold text-primary">
                ₹{Math.max(data.remaining, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className={clsx(
        "fixed inset-0 z-[100] flex justify-end transition-all duration-500",
        isPanelOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div 
          className={clsx("absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-500", isPanelOpen ? "opacity-100" : "opacity-0")}
          onClick={() => {
            setIsPanelOpen(false);
            setFormData({ id: null, categoryId: '', amountLimit: '' });
          }}
        />
        <div className={clsx(
          "relative w-full max-w-lg bg-surface h-full shadow-2xl p-10 flex flex-col transform transition-transform duration-500 ease-out md:rounded-l-3xl",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}>
           <div className="flex items-center justify-between mb-12">
              <h2 className="font-manrope text-2xl font-bold text-on-surface">
                {formData.id ? "Edit Threshold" : "Set Allocation"}
              </h2>
              <button onClick={() => setIsPanelOpen(false)} className="p-3 bg-surface-low rounded-xl text-on-surface-variant hover:text-tertiary transition-colors">
                <X size={24} />
              </button>
           </div>

           <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Category Focus</label>
                  <select 
                    required
                    value={formData.categoryId}
                    disabled={!!formData.id}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-surface-low border-2 border-surface-low rounded-2xl px-6 py-4 text-on-surface font-medium focus:border-primary focus:bg-surface-lowest transition-all outline-none appearance-none"
                  >
                    <option value="">Select a sector</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Metric Threshold (₹)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0"
                    value={formData.amountLimit}
                    onChange={(e) => setFormData({...formData, amountLimit: e.target.value})}
                    className="w-full bg-surface-low border-2 border-surface-low rounded-2xl px-6 py-4 text-on-surface font-manrope text-2xl font-bold focus:border-primary focus:bg-surface-lowest transition-all outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full primary-gradient text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Syncing..." : (formData.id ? "Update Threshold" : "Activate Budget")}
                </button>
                <p className="text-[10px] text-center text-on-surface-variant font-medium uppercase tracking-widest opacity-60">
                  Secured by Kinetic Ledger Protocol
                </p>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
