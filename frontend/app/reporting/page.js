"use client";

import { useState, useEffect } from "react";
import { BarChart3, LineChart, PieChart, ArrowUpRight, Loader2, Download } from "lucide-react";
import api from "../../lib/api";

export default function ReportingPage() {
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sourceRes, statusRes, trendRes] = await Promise.all([
          api.get("/reports/leads-by-source/"),
          api.get("/reports/leads-by-status/"),
          api.get("/reports/campaign-trend/"),
        ]);
        setSources(sourceRes.data);
        setStatuses(statusRes.data);
        setTrend(trendRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export/leads.csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            Reporting <BarChart3 className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">
            Actionable insights and exportable data for your team.
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-all shadow-lg"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
            <PieChart className="w-5 h-5 text-primary" /> Leads by Source
          </h3>
          <div className="space-y-4 relative z-10">
            {sources.map((item, i) => {
              const max = Math.max(...sources.map((s) => s.count));
              const percent = (item.count / max) * 100;
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{item.source.replace("_", " ")}</span>
                    <span className="text-muted-foreground font-bold">{item.count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border/50">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {sources.length === 0 && <p className="text-sm text-muted-foreground">No source data available.</p>}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
            <BarChart3 className="w-5 h-5 text-accent" /> Leads by Status
          </h3>
          <div className="space-y-4 relative z-10">
            {statuses.map((item, i) => {
              const max = Math.max(...statuses.map((s) => s.count));
              const percent = (item.count / max) * 100;
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{item.status}</span>
                    <span className="text-muted-foreground font-bold">{item.count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border/50">
                    <div className="h-full bg-accent transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {statuses.length === 0 && <p className="text-sm text-muted-foreground">No status data available.</p>}
          </div>
        </div>
      </div>

      {/* Campaign Trend */}
      <div className="glass rounded-2xl p-6 border border-border/50 shadow-sm">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <LineChart className="w-5 h-5 text-warning" /> Campaign Creation Trend (Last 30 Days)
        </h3>
        
        <div className="h-64 flex items-end gap-2 pb-6 px-4 border-b border-border/50 relative">
          {trend.length > 0 ? trend.map((item, i) => {
            const max = Math.max(...trend.map((t) => t.campaigns));
            const height = max > 0 ? (item.campaigns / max) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                <div 
                  className="w-full bg-warning/50 border border-warning/80 rounded-t-sm group-hover:bg-warning transition-colors relative"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.campaigns} campaigns<br/>
                    {new Date(item.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No campaign data available.
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-4 px-4 font-medium uppercase tracking-wider">
          <span>{trend.length > 0 ? new Date(trend[0].date).toLocaleDateString() : '30 days ago'}</span>
          <span>{trend.length > 0 ? new Date(trend[trend.length-1].date).toLocaleDateString() : 'Today'}</span>
        </div>
      </div>
    </div>
  );
}
