"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building, Mail, Phone, ExternalLink, CalendarDays, Zap, MessageSquare, Clock, RefreshCw, CheckCircle2, User, Sparkles, Send } from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  async function fetchLead() {
    try {
      const res = await api.get(`/leads/${params.id}/`);
      setLead(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const generateFollowup = async () => {
    setGenerating(true);
    try {
      await api.post(`/leads/${params.id}/followup/`);
      await fetchLead();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const scoreLead = async () => {
    setScoring(true);
    try {
      await api.post(`/leads/${params.id}/score/`);
      await fetchLead();
    } catch (err) {
      console.error(err);
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!lead) {
    return <div className="text-center py-20 text-muted-foreground">Lead not found</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success border-success/30 bg-success/10";
    if (score >= 50) return "text-warning border-warning/30 bg-warning/10";
    return "text-muted-foreground border-border bg-foreground/5";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* Header & Back */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/leads" className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-muted-foreground">Back to Leads</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Col: Lead Profile & AI Insight */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-lg relative overflow-hidden">
            {lead.lead_score >= 80 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            )}
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border font-bold text-3xl mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                {lead.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-balance">{lead.name}</h2>
              <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Building className="w-4 h-4" /> {lead.company || "Unknown Company"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{lead.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lead.phone || "No phone"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{lead.source_display}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">Status</p>
              <select 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none font-medium"
                value={lead.status}
                onChange={() => {}}
                disabled
              >
                <option value={lead.status}>{lead.status_display}</option>
              </select>
            </div>
          </div>

          {/* AI Score Card */}
          <div className="glass rounded-2xl p-6 border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent fill-accent" /> AI Score</h3>
              <button onClick={scoreLead} disabled={scoring} className="text-xs text-primary hover:underline flex items-center gap-1">
                {scoring ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Re-score
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-2xl shadow-lg ${getScoreColor(lead.lead_score)}`}>
                {lead.lead_score}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Probability</p>
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                  lead.conversion_probability === 'high' ? 'bg-success/20 text-success' : 
                  lead.conversion_probability === 'medium' ? 'bg-warning/20 text-warning' : 'bg-foreground/10 text-muted-foreground'
                }`}>
                  {lead.conversion_probability}
                </span>
              </div>
            </div>

            <div className="bg-background/50 rounded-xl p-3 border border-border text-xs text-muted-foreground leading-relaxed">
              {lead.score_reason || "Score computed based on lead profile and engagement."}
            </div>
          </div>
        </div>

        {/* Right Col: Actions & Timeline */}
        <div className="md:col-span-2 space-y-6">
          
          {/* AI Follow-up Gen */}
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-[var(--shadow-glow)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Copilot: Smart Follow-up
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4 relative z-10">
              It's been <strong className="text-foreground">{lead.days_since_contact} days</strong> since {lead.name} was last contacted. Let AI draft a personalized follow-up message based on their profile and status.
            </p>

            {lead.follow_up_suggestion ? (
              <div className="mb-4 relative z-10">
                <div className="bg-background border border-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {lead.follow_up_suggestion}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Generated {new Date(lead.follow_up_generated_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={generateFollowup} disabled={generating} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-white/5 transition-colors flex items-center gap-1.5">
                      {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Regenerate
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20">
                      <Send className="w-3.5 h-3.5" /> Send to Channel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <button 
                  onClick={generateFollowup}
                  disabled={generating}
                  className="w-full py-4 rounded-xl border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors flex flex-col items-center justify-center gap-2 font-medium"
                >
                  {generating ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing lead data...</>
                  ) : (
                    <><Sparkles className="w-6 h-6" /> Generate Follow-up Message</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-muted-foreground" /> Activity Timeline
            </h3>

            <div className="space-y-6">
              {lead.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
              ) : (
                lead.activities.map((act, i) => (
                  <div key={act.id} className="flex gap-4 relative">
                    {i !== lead.activities.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-px bg-border -translate-x-1/2" />}
                    
                    <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 z-10">
                      {act.activity_type === 'created' ? <User className="w-4 h-4 text-muted-foreground" /> :
                       act.activity_type === 'status_change' ? <RefreshCw className="w-4 h-4 text-accent" /> :
                       act.activity_type === 'note' ? <MessageSquare className="w-4 h-4 text-primary" /> :
                       act.activity_type === 'contacted' ? <Mail className="w-4 h-4 text-warning" /> :
                       <CheckCircle2 className="w-4 h-4 text-success" />}
                    </div>

                    <div>
                      <p className="text-sm font-semibold">{act.activity_type_display}</p>
                      <p className="text-sm text-muted-foreground mt-1 bg-background/50 p-2 rounded-lg border border-border/50 leading-relaxed">{act.note}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5 uppercase tracking-wider">{new Date(act.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
