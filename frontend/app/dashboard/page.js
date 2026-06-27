"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Users, Target, Megaphone, Send, Sparkles, ChevronRight, Play, Plus, BarChart3, Clock, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_campaigns: 0,
    active_campaigns: 0,
    generated_content: 0,
    audience_segments: 0,
    total_leads: 0,
    converted_leads: 0,
    conversion_rate: 0,
    followup_needed: 0,
  });
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, notifRes] = await Promise.all([
          api.get("/reports/dashboard/"),
          api.get("/reports/notifications/"),
        ]);
        setStats(dashRes.data);
        setNotifications(notifRes.data);
      } catch (error) {
        console.error("Dashboard load error", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const cards = [
    { label: "Total Leads", value: stats.total_leads, icon: Users, trend: "+12.5%", isPositive: true, href: "/leads" },
    { label: "Active Campaigns", value: stats.active_campaigns, icon: Megaphone, trend: "+1", isPositive: true, href: "/campaigns" },
    { label: "AI Content Generated", value: stats.generated_content, icon: Sparkles, trend: "+4", isPositive: true, href: "/campaigns" },
    { label: "Lead Conversion", value: `${stats.conversion_rate}%`, icon: Target, trend: "+2.1%", isPositive: true, href: "/analytics" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Hero & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Welcome to XenoReach AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Launch smarter campaigns powered by AI.
          </p>
        </div>
        
        {/* Quick Actions (Glassmorphism) */}
        <div className="glass rounded-xl p-2 flex items-center gap-2 shadow-sm">
          <Link href="/ai-planner" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4" /> AI Planner
          </Link>
          <Link href="/campaigns" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-foreground/5 text-sm font-medium transition-colors">
            <Megaphone className="w-4 h-4" /> Campaign
          </Link>
          <Link href="/segments" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-foreground/5 text-sm font-medium transition-colors">
            <Target className="w-4 h-4" /> Segment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative p-6 rounded-2xl glass hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-background border border-border shadow-sm">
                <card.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                card.isPositive ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
              }`}>
                {card.trend}
              </span>
            </div>
            
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {card.value === 0 ? <div className="skeleton w-16 h-8 mt-1" /> : card.value.toLocaleString()}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Funnel */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Global Campaign Funnel
            </h3>
            <Link href="/analytics" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4 relative z-10">
            {/* Funnel bars */}
            <FunnelBar label="Target Audience" value="12,450" percent="100%" color="bg-muted" />
            <FunnelBar label="Delivered" value="11,802" percent="94%" color="bg-blue-500" />
            <FunnelBar label="Opened" value="5,210" percent="41%" color="bg-amber-500" />
            <FunnelBar label="Clicked" value="1,840" percent="14%" color="bg-primary" />
            <FunnelBar label="Converted" value="412" percent="3%" color="bg-success" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-muted-foreground" /> Activity Feed
          </h3>
          
          <div className="flex-1 space-y-6">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-4">No recent activity.</p>
            ) : (
              notifications.map((act, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== notifications.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-px bg-border -translate-x-1/2" />}
                  <div className={`w-8 h-8 rounded-full ${act.type === 'warning' ? 'bg-warning/10 text-warning' : act.type === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0 border border-border/50 shadow-sm z-10`}>
                    {act.type === 'warning' ? <Clock className="w-4 h-4" /> : act.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </div>
                  <div>
                    <Link href={act.link} className="text-sm font-semibold hover:text-primary transition-colors">{act.title}</Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">Just now</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="relative rounded-2xl glass overflow-hidden border border-border shadow-[var(--shadow-glow)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-accent shadow-[var(--shadow-glow)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Growth Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightItem title="Best Performing Segment" value="High-Value Delhi" confidence="94%" reason="Historically 3x higher AOV." />
            <InsightItem title="Best Channel" value="WhatsApp" confidence="98%" reason="85% open rate across last 5 campaigns." />
            <InsightItem title="Highest ROI Campaign" value="Diwali Reactivation" confidence="91%" reason="Generated ₹1.2M with low bounce." />
            <InsightItem title="Most Responsive City" value="Bangalore" confidence="88%" reason="Fastest click-to-convert time." />
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, percent, color }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-32 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
      <div className="flex-1 h-8 bg-background rounded-r-lg rounded-l-sm border border-border overflow-hidden relative">
        <div className={`h-full ${color} transition-all duration-1000 ease-out flex items-center px-3 opacity-90`} style={{ width: percent }}>
          <span className="text-xs font-bold text-white drop-shadow-md">{value}</span>
        </div>
      </div>
      <div className="w-12 text-right text-xs font-bold text-muted-foreground">{percent}</div>
    </div>
  );
}

function InsightItem({ title, value, confidence, reason }) {
  return (
    <div className="p-5 rounded-2xl bg-background/40 border border-border backdrop-blur-md hover:scale-[1.02] transition-transform duration-300">
      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-accent" /> {title}</p>
      <p className="text-lg font-bold text-foreground mb-4 text-balance">{value}</p>
      
      <div className="flex flex-col gap-2 mt-auto">
        <p className="text-xs text-muted-foreground bg-foreground/5 p-2 rounded-lg leading-relaxed">{reason}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Confidence</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: confidence }} />
            </div>
            <span className="text-xs font-bold text-success">{confidence}</span>
          </div>
        </div>
      </div>
    </div>
  );
}