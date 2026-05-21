"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  LineChart, 
  Wallet, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useTheme } from "next-themes";

import useSWR, { useSWRConfig } from "swr";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function Sidebar() {
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const { data: settingsData } = useSWR('/api/settings', fetcher);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const user = settingsData?.user || { name: "User", email: "" };
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (settingsData?.user) {
      setProfileForm({ 
        name: settingsData.user.name, 
        email: settingsData.user.email 
      });
    }
  }, [settingsData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        mutate('/api/settings');
        setIsProfileOpen(false);
      }
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Budget", href: "/budget", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.href = '/login';
  };

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface-lowest ghost-shadow sticky top-0 z-40">
        <div className="flex items-center">
          {mounted && (
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg">
              <Zap size={24} fill="currentColor" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-surface-low text-on-surface-variant hover:text-primary transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-surface-low text-on-surface-variant hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar / Mobile Drawer Over */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface flex flex-col p-6 border-r border-surface-low transition-transform duration-300 md:relative md:translate-x-0 md:h-full md:overflow-y-auto custom-scrollbar",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full shadow-2xl md:shadow-none"
      )}>
        <div className="hidden md:flex items-center justify-center mb-12">
          {mounted && (
            <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-on-primary shadow-2xl hover:scale-105 transition-transform duration-300">
              <Zap size={40} fill="currentColor" />
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-surface-low">
           <h2 className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Menu</h2>
           <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-on-surface-variant"><X size={20}/></button>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                   "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-250",
                   isActive 
                     ? "bg-surface-lowest ghost-shadow text-primary font-bold border-l-4 border-primary pl-3" 
                     : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                )}
              >
                <Icon size={20} className={clsx(isActive ? "text-primary" : "text-on-surface-variant")} />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 flex flex-col gap-5 border-t border-surface-low">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          )}
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <div className="w-11 h-11 rounded-2xl primary-gradient flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform duration-200 uppercase">
              {user.name.substring(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase">PRO ACCOUNT</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-surface-low text-xs font-bold text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary hover:border-tertiary/20 transition-all active:scale-95"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {(isMobileMenuOpen || isProfileOpen) && (
        <div 
          onClick={() => { setIsMobileMenuOpen(false); setIsProfileOpen(false); }}
          className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-[45]"
        />
      )}

      {/* Profile Slide-over Panel */}
      <div className={clsx(
        "fixed inset-0 z-[60] flex justify-end transition-all duration-500",
        isProfileOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={clsx(
          "relative w-full max-w-md bg-surface h-full shadow-2xl p-8 flex flex-col transform transition-transform duration-500 ease-out md:rounded-l-3xl",
          isProfileOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-12">
              <div className="flex flex-col">
                <h2 className="font-manrope text-2xl font-bold text-on-surface">Identity Hub</h2>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Personal Sanctuary Settings</p>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="p-3 bg-surface-low rounded-2xl text-on-surface-variant hover:text-tertiary transition-colors">
                <X size={24} />
              </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="w-24 h-24 rounded-[2rem] primary-gradient flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                {user.name.substring(0,2).toUpperCase()}
              </div>
              <p className="text-primary font-bold tracking-widest text-[10px] uppercase">Pro Tier Access Activated</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Legacy Name</label>
                <input 
                   type="text" 
                   value={profileForm.name}
                   onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                   className="w-full bg-surface-low border-2 border-transparent rounded-[1.25rem] px-6 py-4 text-on-surface font-bold focus:border-primary focus:bg-surface-lowest transition-all outline-none"
                   placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Secure Email</label>
                <input 
                   type="email" 
                   value={profileForm.email}
                   onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                   className="w-full bg-surface-low border-2 border-transparent rounded-[1.25rem] px-6 py-4 text-on-surface font-bold focus:border-primary focus:bg-surface-lowest transition-all outline-none"
                   placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full primary-gradient text-white font-bold py-5 rounded-[1.5rem] shadow-[0_12px_32px_-8px_rgba(77,68,227,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isUpdating ? "Syncing Identity..." : "Update Private Profile"}
              </button>
              <div className="flex items-center justify-center gap-2 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.3em]">Encrypted Session Active</p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Bottom Bar (Sticky Nav) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-surface-lowest/90 backdrop-blur-md rounded-[2rem] ghost-shadow border border-surface-low p-2 z-[40] flex justify-around items-center">
         {navLinks.slice(0, 4).map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={clsx(
                   "p-4 rounded-full transition-all",
                   isActive ? "bg-primary text-white shadow-lg" : "text-on-surface-variant"
                )}
              >
                 <Icon size={22} />
              </Link>
            );
         })}
      </nav>
    </>
  );
}

