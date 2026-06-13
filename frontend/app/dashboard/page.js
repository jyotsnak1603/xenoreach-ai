"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Users, Target, Megaphone, Send, Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    segments: 0,
    campaigns: 0,
    communications: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [customers, segments, campaigns, communications] =
          await Promise.all([
            api.get("/customers/"),
            api.get("/segments/"),
            api.get("/campaigns/"),
            api.get("/communications/"),
          ]);

        setStats({
          customers: customers.data.length,
          segments: segments.data.length,
          campaigns: campaigns.data.length,
          communications: communications.data.length,
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadStats();
  }, []);

  const cards = [
    { label: "Total Customers", value: stats.customers, icon: Users, trend: "+12.5%", isPositive: true },
    { label: "Active Segments", value: stats.segments, icon: Target, trend: "+4.2%", isPositive: true },
    { label: "Campaigns Created", value: stats.campaigns, icon: Megaphone, trend: "+18.1%", isPositive: true },
    { label: "Messages Sent", value: stats.communications, icon: Send, trend: "+24.0%", isPositive: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, Marketer
        </h1>
        <p className="text-muted-foreground text-lg">
          Launch smarter campaigns powered by AI.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div
            key={card.label}
            className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-background border border-border">
                <card.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                card.isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {card.trend}
              </span>
            </div>
            
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {card.value.toLocaleString()}
              </h2>
            </div>

            {/* Faux Sparkline */}
            <div className="mt-4 h-8 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-primary rounded-t-sm transition-all duration-1000" style={{ height: '0%', animation: `grow ${1 + (i * 0.1)}s ease forwards` }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Section */}
      <div className="relative rounded-2xl border border-border overflow-hidden bg-card">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Growth Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightItem 
              title="Best Performing Segment" 
              value="High-Value Delhi Customers" 
              confidence="94%" 
            />
            <InsightItem 
              title="Best Channel" 
              value="WhatsApp" 
              confidence="98%" 
            />
            <InsightItem 
              title="Highest Converting Campaign" 
              value="Diwali VIP Reactivation" 
              confidence="91%" 
            />
            <InsightItem 
              title="Most Responsive City" 
              value="Bangalore" 
              confidence="88%" 
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Link href="/analytics" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-colors text-sm font-medium">
              View Detailed Report <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightItem({ title, value, confidence }) {
  return (
    <div className="p-5 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
      <p className="text-sm font-medium text-muted-foreground mb-3">{title}</p>
      <p className="text-lg font-semibold text-foreground mb-4">{value}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-muted-foreground">AI Confidence</span>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-success" style={{ width: confidence }} />
          </div>
          <span className="text-xs font-bold text-success">{confidence}</span>
        </div>
      </div>
    </div>
  );
}