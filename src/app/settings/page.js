"use client";

import { 
  Bell, 
  ShieldAlert, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Database,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "", email: "" });
  const [summaries, setSummaries] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [emails, setEmails] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setSummaries(data.user.preferences.summaries ?? true);
        setAlerts(data.user.preferences.alerts ?? true);
        setEmails(data.user.preferences.emails ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const newPrefs = {
      summaries: key === 'summaries' ? value : summaries,
      alerts: key === 'alerts' ? value : alerts,
      emails: key === 'emails' ? value : emails,
    };
    
    // Optimistic UI
    if (key === 'summaries') setSummaries(value);
    if (key === 'alerts') setAlerts(value);
    if (key === 'emails') setEmails(value);

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPrefs })
      });
    } catch (e) {
      console.error(e);
      // Revert on error
      fetchSettings();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-24">
      <header className="mb-12">
        <h2 className="text-on-surface-variant mb-1">Premium Financial Curator</h2>
        <h1 className="font-manrope text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Settings</h1>
      </header>

      <div className="flex flex-col gap-8">
        
        {/* Profile Card */}
        <section className="bg-surface-lowest p-8 rounded-3xl ghost-shadow flex items-center gap-6 border-l-4 border-primary">
          <div className="w-16 h-16 rounded-full primary-gradient text-white flex items-center justify-center text-xl font-bold shadow-sm uppercase">
            {user.name.substring(0, 2) || "AP"}
          </div>
          <div>
            <h3 className="font-manrope text-2xl font-bold text-on-surface">{user.name}</h3>
            <p className="text-on-surface-variant font-medium">{user.email}</p>
          </div>
          <button className="ml-auto px-6 py-3 bg-surface-low text-on-surface font-semibold rounded-full hover:bg-surface-container-high transition-colors text-sm">
            Edit Profile
          </button>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-on-surface-variant" size={24} />
            <h3 className="font-manrope text-2xl font-bold text-on-surface tracking-tight">Notifications</h3>
          </div>
          <div className="bg-surface-lowest p-6 px-8 rounded-3xl ghost-shadow flex flex-col divide-y divide-surface-low">
            
            <div className="py-6 flex items-center justify-between first:pt-2 last:pb-2">
              <div>
                <h4 className="font-bold text-on-surface text-lg">Monthly summaries</h4>
                <p className="text-on-surface-variant text-sm mt-1">Review your financial health every 30 days</p>
              </div>
              <button onClick={() => updatePreference('summaries', !summaries)} className="text-primary hover:scale-110 transition-transform">
                {summaries ? <ToggleRight size={40} className="fill-primary/10" /> : <ToggleLeft size={40} className="text-on-surface-variant" />}
              </button>
            </div>

            <div className="py-6 flex items-center justify-between first:pt-2 last:pb-2">
              <div>
                <h4 className="font-bold text-on-surface text-lg">Budget alerts</h4>
                <p className="text-on-surface-variant text-sm mt-1">Notify when reaching 80% of budget limit</p>
              </div>
              <button onClick={() => updatePreference('alerts', !alerts)} className="text-primary hover:scale-110 transition-transform">
                {alerts ? <ToggleRight size={40} className="fill-primary/10" /> : <ToggleLeft size={40} className="text-on-surface-variant" />}
              </button>
            </div>

            <div className="py-6 flex items-center justify-between first:pt-2 last:pb-2">
              <div>
                <h4 className="font-bold text-on-surface text-lg">Email notifications</h4>
                <p className="text-on-surface-variant text-sm mt-1">Receive security and system updates via email</p>
              </div>
              <button onClick={() => updatePreference('emails', !emails)} className="text-primary hover:scale-110 transition-transform">
                {emails ? <ToggleRight size={40} className="fill-primary/10" /> : <ToggleLeft size={40} className="text-on-surface-variant" />}
              </button>
            </div>

          </div>
        </section>

        {/* Data Management */}
        <section>
          <div className="flex items-center gap-3 mb-6 mt-4">
            <Database className="text-on-surface-variant" size={24} />
            <h3 className="font-manrope text-2xl font-bold text-on-surface tracking-tight">Data Management</h3>
          </div>
          
          <div className="bg-[#fff5f6] p-8 rounded-3xl border border-tertiary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-tertiary mb-2">
                <ShieldAlert size={20} />
                <h4 className="font-bold uppercase tracking-wider text-sm">Danger Zone</h4>
              </div>
              <h5 className="font-bold text-lg text-[#3a0011] mb-1">Delete Account Data</h5>
              <p className="text-on-surface-variant text-sm max-w-md leading-relaxed">
                Deleting your data is permanent and cannot be undone. All transactions, budgets, and historical data will be wiped.
              </p>
              <p className="text-xs font-semibold text-tertiary/70 mt-4">Sync status: Active</p>
            </div>
            
            <button 
              onClick={async () => {
                if (confirm("Are you SURE you want to delete all your financial data? This cannot be undone.")) {
                   const res = await fetch('/api/auth/reset-data', { method: 'DELETE' });
                   if (res.ok) alert("Data successfully cleared.");
                   else alert("Failed to clear data.");
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-tertiary text-white font-bold rounded-full hover:bg-[#7a0023] transition-colors shadow-sm ml-auto"
            >
              <Trash2 size={18} />
              <span>Erase All Data</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
