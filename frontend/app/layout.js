"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./globals.css";
import {
  LayoutDashboard,
  Users,
  Target,
  Megaphone,
  Sparkles,
  BarChart3,
  Search,
  Bell,
  CircleUser,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Segments", href: "/segments", icon: Target },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "AI Planner", href: "/ai-planner", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              isActive
                ? "bg-primary/10 text-foreground border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <item.icon
              className={`w-5 h-5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "group-hover:text-primary"
              }`}
            />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function RootLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profRef.current && !profRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      alert(`Searching for: ${e.target.value}`);
      e.target.value = "";
    }
  };

  return (
    <html lang="en" className="dark">
      <body className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col transition-all">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                XenoReach AI
              </span>
            </Link>
          </div>

          <SidebarNav />

          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <span className="text-xs font-bold text-white">MR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Marketer</p>
                <p className="text-xs text-muted-foreground truncate">
                  Free Plan
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-8 z-10">
            <div className="flex-1 max-w-md relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search campaigns, customers... (Press Enter)"
                onKeyDown={handleSearch}
                className="w-full bg-card/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-4 pl-4">
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                  className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 font-bold text-sm border-b border-border mb-2">Notifications</div>
                    <div className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer">
                      <p className="font-semibold text-primary">Campaign Finished</p>
                      <p className="text-muted-foreground text-xs">Diwali VIP Reactivation completed.</p>
                    </div>
                    <div className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer">
                      <p className="font-semibold text-accent">New AI Insight</p>
                      <p className="text-muted-foreground text-xs">A new segment opportunity found.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={profRef}>
                <button 
                  onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <CircleUser className="w-5 h-5" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 font-bold text-sm border-b border-border mb-2">My Account</div>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/5">Settings</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/5">Billing</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 mt-2 border-t border-border pt-3">Log out</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-card/30 via-background to-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}