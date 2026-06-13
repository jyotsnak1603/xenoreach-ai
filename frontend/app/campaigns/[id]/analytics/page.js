"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../../lib/api";
import { Sparkles, ArrowLeft, Download, TrendingUp, Users, MousePointerClick, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function CampaignAnalyticsPage() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    api.get(`/campaigns/${id}/analytics/`)
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await api.post(`/campaigns/${id}/ai-insights/`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Funnel Data for Recharts
  const funnelData = [
    { name: 'Audience', value: analytics.audience_count, fill: 'var(--color-muted)' },
    { name: 'Delivered', value: analytics.delivered, fill: 'var(--color-primary)' },
    { name: 'Opened', value: analytics.opened_or_read, fill: 'var(--color-accent)' },
    { name: 'Clicked', value: analytics.clicked, fill: 'var(--color-warning)' },
    { name: 'Converted', value: analytics.converted, fill: 'var(--color-success)' },
  ];

  // Mock Trend Data
  const trendData = [
    { name: 'Day 1', opens: Math.floor(analytics.opened_or_read * 0.1), clicks: Math.floor(analytics.clicked * 0.1) },
    { name: 'Day 2', opens: Math.floor(analytics.opened_or_read * 0.4), clicks: Math.floor(analytics.clicked * 0.3) },
    { name: 'Day 3', opens: Math.floor(analytics.opened_or_read * 0.3), clicks: Math.floor(analytics.clicked * 0.4) },
    { name: 'Day 4', opens: Math.floor(analytics.opened_or_read * 0.15), clicks: Math.floor(analytics.clicked * 0.15) },
    { name: 'Day 5', opens: Math.floor(analytics.opened_or_read * 0.05), clicks: Math.floor(analytics.clicked * 0.05) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className="font-medium text-foreground">{analytics.campaign_name}</span> 
            <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
            <span className="capitalize">{analytics.channel}</span>
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-white/5 transition-colors font-medium text-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue Generated", value: `₹${analytics.revenue_generated.toLocaleString()}`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "Conversion Rate", value: `${analytics.conversion_rate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Click Rate", value: `${analytics.click_rate}%`, icon: MousePointerClick, color: "text-accent", bg: "bg-accent/10" },
          { label: "Open Rate", value: `${analytics.open_rate}%`, icon: Activity, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Engagement Trend */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-6">Engagement Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="opens" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorOpens)" />
                  <Area type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-6">Campaign Funnel</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#F8FAFC', fontSize: 13, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights & Raw Stats */}
        <div className="space-y-8">
          
          {/* AI Insights Card */}
          <div className="relative rounded-2xl border border-primary/30 overflow-hidden bg-card shadow-[0_0_30px_rgba(99,102,241,0.05)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  AI Campaign Insights
                </h2>
              </div>

              {!insights ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-6">Analyze campaign performance using AI to uncover hidden patterns and actionable next steps.</p>
                  <button
                    onClick={generateInsights}
                    disabled={loadingInsights}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingInsights ? (
                      <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate Insights</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Structured Insight Cards */}
                  {(insights.best_channel || insights.best_metric_value) && (
                    <div className="grid grid-cols-1 gap-3">
                      {insights.best_channel && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Best Channel</p>
                          <p className="font-bold capitalize">{insights.best_channel}</p>
                          {insights.best_channel_reason && (
                            <p className="text-xs text-muted-foreground mt-1">{insights.best_channel_reason}</p>
                          )}
                        </div>
                      )}
                      {insights.best_metric && (
                        <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                          <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-1">Top Metric</p>
                          <p className="font-bold capitalize">{insights.best_metric.replace(/_/g, " ")}</p>
                          {insights.best_metric_value && (
                            <p className="text-xl font-black text-success">{insights.best_metric_value}</p>
                          )}
                        </div>
                      )}
                      {insights.recommended_segment && (
                        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Best Segment Next Time</p>
                          <p className="font-bold text-sm">{insights.recommended_segment}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-background/50 border border-border text-sm leading-relaxed text-foreground">
                    <span className="font-semibold text-primary block mb-1">Summary</span>
                    {insights.summary}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-success/5 border border-success/10 text-xs">
                      <span className="font-semibold text-success block mb-1">What Worked</span>
                      {insights.what_worked}
                    </div>
                    <div className="p-3 rounded-xl bg-danger/5 border border-danger/10 text-xs">
                      <span className="font-semibold text-danger block mb-1">Needs Improvement</span>
                      {insights.what_did_not_work}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <span className="font-semibold text-accent text-xs block mb-1 uppercase tracking-wider">Recommended Next Action</span>
                    <p className="text-sm font-medium">{insights.recommended_next_action}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Confidence Score</span>
                    <span className="text-xs font-bold text-success flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      {insights.confidence_score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Delivery Stats */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Delivery Overview</h3>
            <div className="space-y-4">
              {[
                { label: "Total Audience", value: analytics.audience_count },
                { label: "Messages Sent", value: analytics.sent },
                { label: "Delivered Successfully", value: analytics.delivered },
                { label: "Failed Deliveries", value: analytics.failed },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}