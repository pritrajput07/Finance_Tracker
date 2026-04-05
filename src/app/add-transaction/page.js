"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Tag, AlignLeft, Calendar, IndianRupee, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState("expense");
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          description,
          categoryId: categoryId || undefined,
          date: date ? new Date(date).toISOString() : new Date().toISOString()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save transaction.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto h-full flex flex-col justify-center pb-32 md:pb-12">
      <header className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="font-manrope text-3xl md:text-5xl font-bold tracking-tight text-on-surface">New Flow</h1>
        <p className="text-on-surface-variant text-lg mt-2 font-medium">Record a new financial movement</p>
      </header>

      <div className="bg-surface-lowest rounded-3xl ghost-shadow p-8 flex flex-col gap-8">
        
        {error && (
          <div className="bg-tertiary/10 text-tertiary p-4 rounded-xl text-sm font-semibold border border-tertiary/20">
            {error}
          </div>
        )}

        {/* Type Switcher */}
        <div className="flex bg-surface rounded-2xl p-2 gap-2 ghost-shadow">
          <button
            onClick={() => setType("expense")}
            type="button"
            className={clsx(
              "flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all",
              type === "expense" 
                ? "bg-surface-lowest text-tertiary shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <ArrowDownRight size={20} />
            <span>Expense</span>
          </button>
          <button
            onClick={() => setType("income")}
            type="button"
            className={clsx(
              "flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all",
              type === "income" 
                ? "bg-surface-lowest text-secondary shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <ArrowUpRight size={20} />
            <span>Income</span>
          </button>
        </div>

        {/* Form Fields */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-on-surface-variant mb-2">Amount</label>
            <div className="relative group">
              <IndianRupee className={clsx(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                type === "expense" ? "text-tertiary" : "text-secondary"
              )} size={24} />
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface py-5 pl-12 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-manrope font-bold text-3xl text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-on-surface-variant mb-2">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input 
                type="text" 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-surface py-4 pl-12 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-on-surface-variant mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-surface py-4 pl-12 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-on-surface-variant mb-2">Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="datetime-local" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface py-4 pl-12 pr-6 rounded-2xl outline-none border border-transparent focus:bg-surface-lowest focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full py-4 rounded-full primary-gradient text-white font-bold text-lg hover:scale-[1.01] transition-transform duration-200 shadow-[0_12px_32px_-4px_rgba(77,68,227,0.3)] disabled:opacity-75 disabled:hover:scale-100 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Save Flow"}
          </button>
        </form>

      </div>
    </div>
  );
}
