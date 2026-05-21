"use client";

import { 
  Bell, 
  ShieldAlert, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Database,
  Loader2,
  X,
  User,
  Mail,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function Settings() {
  const { mutate } = useSWRConfig();
  const { data: settingsData, isLoading } = useSWR('/api/settings', fetcher);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const user = settingsData?.user || { name: "", email: "", preferences: {} };
  const summaries = user.preferences.summaries ?? true;
  const alerts = user.preferences.alerts ?? true;
  const emails = user.preferences.emails ?? false;

  useEffect(() => {
    if (settingsData?.user) {
      setFormData({ 
        name: settingsData.user.name || "", 
        email: settingsData.user.email || "" 
      });
    }
  }, [settingsData]);

  const updatePreference = async (key, value) => {
    const newPrefs = {
      summaries: key === 'summaries' ? value : summaries,
      alerts: key === 'alerts' ? value : alerts,
      emails: key === 'emails' ? value : emails,
    };
    
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPrefs })
      });
      mutate('/api/settings');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        mutate('/api/settings');
        setIsEditProfileOpen(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !settingsData) {
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
            {user.name?.substring(0, 2) || "AP"}
          </div>
          <div>
            <h3 className="font-manrope text-2xl font-bold text-on-surface">{user.name}</h3>
            <p className="text-on-surface-variant font-medium">{user.email}</p>
          </div>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="ml-auto px-6 py-3 bg-surface-low text-on-surface font-semibold rounded-full hover:bg-surface-container-high transition-colors text-sm"
          >
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

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-surface-low flex items-center justify-between">
              <h3 className="font-manrope text-xl font-bold text-on-surface">Edit Profile</h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 hover:bg-surface-low rounded-full transition-colors text-on-surface-variant"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1 flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium transition-all"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
