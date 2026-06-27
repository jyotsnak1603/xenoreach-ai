"use client";

import { useState } from "react";
import { BrainCircuit, Zap, TrendingUp, AlertTriangle, Lightbulb, Users, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);

  const insights = [
    {
      id: 1,
      type: "opportunity",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      title: "Untapped High-Value Segment",
      description: "AI detected 124 users in 'Delhi VIPs' who haven't been contacted in 45 days. Historically, they have a 22% conversion rate when sent a personalized RCS message.",
      action: "Create Campaign",
      confidence: "94%",
      link: "/ai-planner"
    },
    {
      id: 2,
      type: "warning",
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
      title: "Campaign Fatigue Detected",
      description: "The 'Summer Sale' campaign has seen a 14% drop in open rates over the last 3 days. AI recommends pausing SMS and shifting budget to WhatsApp.",
      action: "View Analytics",
      confidence: "88%",
      link: "/reporting"
    },
    {
      id: 3,
      type: "optimization",
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Optimal Send Time Adjustment",
      description: "Based on historical open rates, shifting your default campaign send time from 10:00 AM to 6:30 PM for the 'Tech Enthusiasts' segment will increase engagement by ~18%.",
      action: "Update Segment",
      confidence: "91%",
      link: "/segments"
    }
  ];

  const metrics = [
    { label: "AI Predictions Made", value: "1,432", trend: "+12%" },
    { label: "Automated Actions", value: "84", trend: "+5%" },
    { label: "Est. Revenue Saved", value: "₹45,000", trend: "+24%" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BrainCircuit className="w-4 h-4" /> AI Intelligence Engine
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            AI Growth Insights
          </h1>
          <p className="text-muted-foreground">
            Proactive recommendations and anomaly detection across your CRM data.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-foreground font-medium rounded-xl hover:bg-white/5 transition-all shadow-sm">
          <Lightbulb className="w-5 h-5 text-warning" /> Generate Fresh Insights
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-primary/50 transition-colors">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{m.label}</p>
              <h3 className="text-2xl font-bold">{m.value}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success font-bold text-sm">
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="glass rounded-2xl p-6 border border-border/50 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${insight.type === 'opportunity' ? 'bg-success' : insight.type === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className={`w-14 h-14 rounded-2xl ${insight.bg} ${insight.color} flex items-center justify-center shrink-0 border border-border/50`}>
                <insight.icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{insight.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                    {insight.confidence} Confidence
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {insight.description}
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link 
                  href={insight.link}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-background border border-border hover:bg-foreground hover:text-background transition-colors font-semibold"
                >
                  {insight.action} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Sell Feature Block */}
      <div className="mt-12 relative rounded-3xl border border-primary/20 bg-primary/5 glass overflow-hidden shadow-[var(--shadow-glow)] p-8 md:p-12 text-center flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 relative z-10">
          <Target className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Want deeper AI analysis?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10">
          Connect your external data sources (Shopify, Stripe, Mixpanel) to allow the AI engine to generate even more precise growth insights across your entire funnel.
        </p>
        
        <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:scale-105 transition-all shadow-xl hover:shadow-primary/20 relative z-10">
          Connect Integrations
        </button>
      </div>

    </div>
  );
}
