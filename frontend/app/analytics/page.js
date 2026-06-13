"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { BarChart3, TrendingUp, Users, MousePointerClick, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function GlobalAnalyticsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/campaigns/")
      .then((res) => {
        setCampaigns(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Mock global data
  const trendData = [
    { name: 'Mon', engagement: 400 },
    { name: 'Tue', engagement: 300 },
    { name: 'Wed', engagement: 550 },
    { name: 'Thu', engagement: 450 },
    { name: 'Fri', engagement: 700 },
    { name: 'Sat', engagement: 650 },
    { name: 'Sun', engagement: 800 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Analytics</h1>
        <p className="text-muted-foreground mt-1">Overview of all your campaign performances.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₹1,24,500", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Avg. Conversion", value: "14.2%", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Clicks", value: "12,403", icon: MousePointerClick, color: "text-accent", bg: "bg-accent/10" },
          { label: "Total Opens", value: "45,291", icon: Users, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl glass border border-[var(--color-glass-border)] hover:border-primary/40 transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} shadow-sm`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl glass border border-[var(--color-glass-border)] shadow-[var(--shadow-glow)]">
        <h3 className="text-lg font-bold mb-6">Weekly Engagement</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="engagement" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorEng)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Campaign Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(camp => (
            <Link key={camp.id} href={`/campaigns/${camp.id}/analytics`} className="group p-5 rounded-2xl glass border border-[var(--color-glass-border)] hover:border-primary/50 transition-all flex flex-col hover:shadow-[var(--shadow-glow)]">
              <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{camp.name}</h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{camp.goal}</p>
              <div className="mt-auto flex items-center justify-between text-sm pt-4 border-t border-border/50">
                <span className="px-2.5 py-1 rounded-md bg-background border border-border capitalize font-medium">{camp.channel}</span>
                <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  View <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground glass border border-[var(--color-glass-border)] rounded-2xl">
              No campaigns available to analyze.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
