"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Tag, AlignLeft, Calendar, IndianRupee, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function AddTransaction() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  
  // Array of transactions
  const [transactions, setTransactions] = useState([
    { id: crypto.randomUUID(), type: "expense", amount: "", description: "", categoryId: "", date: "" }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const addRow = () => {
    setTransactions([
      ...transactions,
      { id: crypto.randomUUID(), type: "expense", amount: "", description: "", categoryId: "", date: "" }
    ]);
  };

  const removeRow = (id) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const updateTransaction = (id, field, value) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = transactions.map(({ type, amount, description, categoryId, date }) => ({
        type,
        amount: parseFloat(amount),
        description,
        categoryId: categoryId || undefined,
        date: date ? new Date(date).toISOString() : new Date().toISOString()
      }));

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save transactions.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen flex flex-col pb-32 md:pb-12">
      <header className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-manrope text-3xl md:text-5xl font-bold tracking-tight text-on-surface">Bulk Entry</h1>
            <p className="text-on-surface-variant text-lg mt-2 font-medium">Record multiple movements at once</p>
          </div>
          <button
            onClick={addRow}
            type="button"
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-all"
          >
            <Plus size={20} />
            <span>Add Row</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-tertiary/10 text-tertiary p-4 rounded-xl text-sm font-semibold border border-tertiary/20 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          {transactions.map((t, index) => (
            <div key={t.id} className="bg-surface-lowest rounded-3xl ghost-shadow p-6 md:p-8 flex flex-col gap-6 relative group/row">
              {transactions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(t.id)}
                  className="absolute -top-3 -right-3 bg-white text-tertiary p-2 rounded-full shadow-lg border border-tertiary/10 opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 z-10"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface text-on-surface-variant font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex flex-1 bg-surface rounded-xl p-1 gap-1">
                  <button
                    onClick={() => updateTransaction(t.id, "type", "expense")}
                    type="button"
                    className={clsx(
                      "flex-1 flex justify-center items-center gap-2 py-2 rounded-lg font-bold transition-all text-sm",
                      t.type === "expense" 
                        ? "bg-surface-lowest text-tertiary shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    <ArrowDownRight size={16} />
                    <span>Expense</span>
                  </button>
                  <button
                    onClick={() => updateTransaction(t.id, "type", "income")}
                    type="button"
                    className={clsx(
                      "flex-1 flex justify-center items-center gap-2 py-2 rounded-lg font-bold transition-all text-sm",
                      t.type === "income" 
                        ? "bg-surface-lowest text-secondary shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    <ArrowUpRight size={16} />
                    <span>Income</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 flex flex-col">
                  <label className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <IndianRupee className={clsx(
                      "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                      t.type === "expense" ? "text-tertiary" : "text-secondary"
                    )} size={18} />
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      required
                      value={t.amount}
                      onChange={(e) => updateTransaction(t.id, "amount", e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-surface py-3 pl-10 pr-4 rounded-xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 transition-all font-manrope font-bold text-xl text-on-surface"
                    />
                  </div>
                </div>

                <div className="md:col-span-9 flex flex-col">
                  <label className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="text" 
                      required
                      value={t.description}
                      onChange={(e) => updateTransaction(t.id, "description", e.target.value)}
                      placeholder="What was this for?"
                      className="w-full bg-surface py-3 pl-10 pr-4 rounded-xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 transition-all font-medium text-on-surface"
                    />
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-col">
                  <label className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <select 
                      value={t.categoryId} 
                      onChange={(e) => updateTransaction(t.id, "categoryId", e.target.value)}
                      className="w-full bg-surface py-3 pl-10 pr-4 rounded-xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 transition-all font-medium text-on-surface appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-col">
                  <label className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="datetime-local" 
                      value={t.date}
                      onChange={(e) => updateTransaction(t.id, "date", e.target.value)}
                      className="w-full bg-surface py-3 pl-10 pr-4 rounded-xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 transition-all font-medium text-on-surface cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-6 flex gap-4 md:relative md:bottom-0">
          <button
            onClick={addRow}
            type="button"
            className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-surface border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all flex justify-center items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Another</span>
          </button>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] md:flex-1 py-4 rounded-2xl primary-gradient text-white font-bold text-lg hover:scale-[1.01] transition-transform duration-200 shadow-[0_12px_32px_-4px_rgba(77,68,227,0.3)] disabled:opacity-75 disabled:hover:scale-100 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : `Save ${transactions.length} Flow${transactions.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
