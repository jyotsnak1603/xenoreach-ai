"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Zap, Phone, Mail, MessageSquare, Clock, ArrowRight, Loader2, Target, CalendarDays, ExternalLink, Star } from "lucide-react";
import api from "../../lib/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await api.get("/leads/");
        setLeads(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success border-success/30 bg-success/10";
    if (score >= 50) return "text-warning border-warning/30 bg-warning/10";
    return "text-muted-foreground border-border bg-foreground/5";
  };

  const getProbColor = (prob) => {
    if (prob === "high") return "bg-success/20 text-success";
    if (prob === "medium") return "bg-warning/20 text-warning";
    return "bg-foreground/10 text-muted-foreground";
  };

  const getStatusBadge = (status) => {
    const map = {
      new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      contacted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      interested: "bg-warning/10 text-warning border-warning/20",
      converted: "bg-success/10 text-success border-success/20",
      lost: "bg-danger/10 text-danger border-danger/20",
    };
    return map[status] || "bg-foreground/10 text-foreground";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            Lead Management <Zap className="w-6 h-6 text-accent" />
          </h1>
          <p className="text-muted-foreground">
            AI-scored leads prioritized for conversion.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Add Lead
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-border/50">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-border border-dashed">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No leads found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or add a new lead.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Link 
              key={lead.id} 
              href={`/leads/${lead.id}`}
              className="glass p-5 rounded-2xl border border-border/50 hover:border-primary/50 transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden"
            >
              {/* Highlight best leads */}
              {lead.lead_score >= 80 && (
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
              )}
              
              <div className="flex-1 min-w-0 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center shrink-0 border border-border font-bold text-lg">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors flex items-center gap-2">
                    {lead.name}
                    {lead.lead_score >= 80 && <Star className="w-4 h-4 text-accent fill-accent" />}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {lead.company || "Unknown"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {lead.days_since_contact}d since contact</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                
                {/* AI Score Badge */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">AI Score</span>
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold shadow-sm ${getScoreColor(lead.lead_score)}`}>
                    {lead.lead_score}
                  </div>
                </div>

                <div className="w-px h-10 bg-border hidden md:block" />

                {/* Status & Prob */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                  <span className={`text-xs px-2 py-1 rounded-md border font-medium text-center ${getStatusBadge(lead.status)}`}>
                    {lead.status_display}
                  </span>
                  {lead.conversion_probability && (
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold text-center ${getProbColor(lead.conversion_probability)}`}>
                      {lead.conversion_probability} Prob
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" onClick={(e) => {e.preventDefault(); window.location.href=`mailto:${lead.email}`}}>
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm" onClick={(e) => {e.preventDefault()}}>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Building({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
  )
}
