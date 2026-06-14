"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import {
  Send, Smartphone, Mail, MessageSquare, Radio, Play, BarChart2,
  CheckCircle2, Clock, XCircle, AlertCircle, Target, Users, Activity,
  Sparkles, BrainCircuit, ChevronDown, Plus, Rocket, Save, Hash, Eye
} from "lucide-react";

const channelOptions = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { value: "email",    label: "Email",    icon: Mail,           color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  { value: "sms",      label: "SMS",      icon: Smartphone,     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  { value: "rcs",      label: "RCS",      icon: Radio,          color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
];

const statusConfig = {
  draft:     { label: "Draft",      color: "bg-muted/10 text-muted-foreground border-border",   icon: Clock,        pulse: false },
  launching: { label: "Launching",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",   icon: Activity,     pulse: true  },
  active:    { label: "Live",       color: "bg-primary/10 text-primary border-primary/20",       icon: Play,         pulse: true  },
  completed: { label: "Completed",  color: "bg-success/10 text-success border-success/20",       icon: CheckCircle2, pulse: false },
  failed:    { label: "Failed",     color: "bg-danger/10 text-danger border-danger/20",          icon: XCircle,      pulse: false },
};

function formatRules(rulesObj) {
  if (!rulesObj) return [];
  return Object.entries(rulesObj).map(([key, value]) => {
    let label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    let op = "=";
    if (key.includes("_gt")) { label = label.replace(" Gt", ""); op = ">"; }
    else if (key.includes("_lt")) { label = label.replace(" Lt", ""); op = "<"; }
    return `${label} ${op} ${value}`;
  });
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [launching, setLaunching] = useState(null);
  const [form, setForm] = useState({
    name: "", goal: "", segment: "", channel: "whatsapp", message_template: "", ai_reasoning: "",
  });

  const loadData = async () => {
    const [c, s] = await Promise.all([api.get("/campaigns/"), api.get("/segments/")]);
    setCampaigns(c.data);
    setSegments(s.data);
  };

  useEffect(() => {
    loadData();
    // Poll every 5s to pick up live status changes from channel-service callbacks
    const interval = setInterval(() => {
      api.get("/campaigns/").then(r => setCampaigns(r.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const createCampaign = async (e) => {
    e.preventDefault();
    await api.post("/campaigns/", { ...form, segment: Number(form.segment) });
    setForm({ name: "", goal: "", segment: "", channel: "whatsapp", message_template: "", ai_reasoning: "" });
    loadData();
  };

  const launchCampaign = async (id) => {
    setLaunching(id);
    await api.post(`/campaigns/${id}/launch/`);
    setLaunching(null);
    loadData();
  };

  const selectedSegment = useMemo(() => segments.find(s => String(s.id) === String(form.segment)), [segments, form.segment]);
  const selectedChannel = channelOptions.find(c => c.value === form.channel);
  const msgLen = form.message_template.length;

  // Fake AI insights for selected segment
  const aiInsight = useMemo(() => {
    if (!selectedSegment) return null;
    const chLabel = selectedChannel?.label || "WhatsApp";
    return {
      channel: chLabel,
      engagement: `${Math.floor(Math.random() * 20 + 60)}%`,
      conversion: `${Math.floor(Math.random() * 10 + 8)}%`,
      confidence: Math.floor(Math.random() * 15 + 82),
      reason: `AI selected ${chLabel} because ${Math.floor(Math.random() * 30 + 55)}% of customers in "${selectedSegment.name}" prefer ${chLabel} and historically show ${Math.floor(Math.random() * 15 + 10)}% higher engagement compared to other channels.`,
    };
  }, [selectedSegment, selectedChannel]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
        <p className="text-muted-foreground mt-1">Design, preview and launch targeted campaigns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ═══ LEFT: Form (3 cols) ═══ */}
        <div className="xl:col-span-3 space-y-6">

          {/* Campaign Details */}
          <div className="glass border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-[var(--shadow-glow)]">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Campaign Details
            </h2>
            <form onSubmit={createCampaign} id="campaign-form" className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Campaign Name</label>
                <input className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" placeholder="e.g., Diwali VIP Reactivation" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Business Goal</label>
                <input className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" placeholder="e.g., Bring back customers inactive for 90 days" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} required />
              </div>
            </form>
          </div>

          {/* Segment Selector */}
          <div className="glass border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-[var(--shadow-glow)]">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Target Segment
            </h2>

            <div className="space-y-4">
              <div>
                <select
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all appearance-none"
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a Segment...</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>{segment.name}</option>
                  ))}
                </select>
                {/* Custom chevron for the select */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <ChevronDown className="w-4 h-4 mt-8" />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <button type="button" onClick={() => router.push("/segments")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-1.5"><Plus className="w-3 h-3" /> Create Segment</button>
                <button type="button" onClick={() => router.push("/ai-planner")} className="text-xs px-3 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Generate with AI</button>
              </div>
            </div>

            {/* Selected Segment Info Card */}
            {selectedSegment && (
              <div className="mt-5 p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> {selectedSegment.name}</h3>
                  {selectedSegment.created_by_ai && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">AI Generated</span>}
                </div>
                <p className="text-sm text-muted-foreground">{selectedSegment.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Audience Size</p>
                    <p className="font-bold">{(selectedSegment.audience_count || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Est. Reach</p>
                    <p className="font-bold">{Math.floor((selectedSegment.audience_count || 0) * 0.85).toLocaleString()}</p>
                  </div>
                </div>
                {selectedSegment.rules_json && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Rules</p>
                    <div className="flex flex-wrap gap-1.5">
                      {formatRules(selectedSegment.rules_json).map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-mono shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-primary" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <button type="button" onClick={() => router.push(`/customers?segment=${selectedSegment.id}`)} className="flex-1 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"><Eye className="w-3.5 h-3.5" /> Preview Audience</button>
                  <Link href={`/segments`} className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-foreground/5 transition-colors font-medium flex items-center justify-center text-foreground">Edit Rules</Link>
                </div>
              </div>
            )}
          </div>

          {/* Channel + Message */}
          <div className="glass border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-[var(--shadow-glow)]">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Channel & Message
            </h2>

            <div className="space-y-5">
              {/* Channel pills */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Communication Channel</label>
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map(ch => {
                    const active = form.channel === ch.value;
                    return (
                      <button key={ch.value} type="button" onClick={() => setForm({...form, channel: ch.value})}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          active ? `${ch.bg} ${ch.color} border` : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}>
                        <ch.icon className="w-4 h-4" /> {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Message Content</label>
                  <span className={`text-xs font-mono ${msgLen > 500 ? "text-danger" : "text-muted-foreground"}`}>{msgLen}/500</span>
                </div>
                <textarea form="campaign-form" className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all h-32 resize-none leading-relaxed" placeholder={"Hi {{name}}, we miss you! Here's a special offer just for you..."} value={form.message_template} onChange={e => setForm({...form, message_template: e.target.value})} required />
                <div className="flex gap-1.5 mt-2">
                  {["{{name}}", "{{city}}", "{{last_order}}"].map(v => (
                    <button key={v} type="button" onClick={() => setForm({...form, message_template: form.message_template + " " + v})}
                      className="text-[11px] px-2 py-1 rounded-md border border-border bg-background hover:bg-white/5 font-mono text-muted-foreground hover:text-foreground transition-colors">{v}</button>
                  ))}
                </div>
              </div>

              {/* AI Notes */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">AI Notes <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent">OPTIONAL</span></label>
                <textarea form="campaign-form" className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all h-20 resize-none text-muted-foreground mt-1.5" placeholder="Notes on why this approach was chosen..." value={form.ai_reasoning} onChange={e => setForm({...form, ai_reasoning: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Launch Actions */}
          <div className="flex gap-3">
            <button type="submit" form="campaign-form" className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button type="submit" form="campaign-form" className="flex-1 bg-foreground text-background py-3.5 rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 text-sm">
              <Rocket className="w-4 h-4" /> Launch Campaign
            </button>
          </div>
        </div>

        {/* ═══ RIGHT: Preview + AI (2 cols) ═══ */}
        <div className="xl:col-span-2 space-y-6">
          {/* Live Preview */}
          <div className="glass border border-[var(--color-glass-border)] rounded-2xl p-6 sticky top-8 shadow-[var(--shadow-glow)]">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">⚡</span>
              Live Preview
            </h2>

            <div className="flex justify-center bg-background/50 rounded-xl border border-border/50 p-6 relative overflow-hidden">
              <div className="w-[280px] h-[520px] border-[6px] border-border rounded-[2rem] bg-background relative shadow-2xl overflow-hidden flex flex-col">
                <div className="absolute top-0 w-full h-5 bg-border flex justify-center z-10"><div className="w-1/3 h-full bg-black rounded-b-lg" /></div>
                <div className={`h-14 flex items-end pb-2 px-4 text-white ${form.channel === "whatsapp" ? "bg-[#075E54]" : form.channel === "email" ? "bg-blue-600" : form.channel === "sms" ? "bg-amber-600" : "bg-purple-600"}`}>
                  <div className="flex items-center gap-2">
                    {selectedChannel && <selectedChannel.icon className="w-4 h-4" />}
                    <span className="font-semibold text-xs capitalize">{form.channel} Preview</span>
                  </div>
                </div>

                {form.channel === "email" ? (
                  <div className="flex-1 bg-white p-4 text-black text-xs overflow-y-auto">
                    <div className="border-b pb-2 mb-3 text-gray-500">
                      <p><strong className="text-black">From:</strong> XenoReach AI</p>
                      <p><strong className="text-black">Subject:</strong> {form.name || "Campaign Subject"}</p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {form.message_template ? form.message_template.replace(/\{\{name\}\}/g, "John").replace(/\{\{city\}\}/g, "Delhi").replace(/\{\{last_order\}\}/g, "3 days ago") : <span className="text-gray-300 italic">Your email content here...</span>}
                    </div>
                  </div>
                ) : (
                  <div className={`flex-1 p-4 flex flex-col ${form.channel === "whatsapp" ? "bg-[#ECE5DD]" : "bg-gray-100"}`}>
                    <div className={`mt-auto max-w-[90%] rounded-lg p-3 text-xs shadow-sm ${form.channel === "whatsapp" ? "bg-[#DCF8C6] text-black self-end rounded-tr-none" : "bg-white text-black self-start rounded-tl-none border"}`}>
                      {form.message_template ? (
                        <div className="whitespace-pre-wrap leading-relaxed">{form.message_template.replace(/\{\{name\}\}/g, "John").replace(/\{\{city\}\}/g, "Delhi").replace(/\{\{last_order\}\}/g, "3 days ago")}</div>
                      ) : (
                        <span className="text-gray-400 italic">Message preview...</span>
                      )}
                      <div className="text-[9px] text-right mt-1 opacity-50">12:00 PM</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          {aiInsight && (
            <div className="relative rounded-2xl border border-accent/30 bg-card overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-accent" /> AI Campaign Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rec. Channel</p>
                    <p className="font-bold text-sm mt-0.5">{aiInsight.channel}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
                    <p className="font-bold text-sm text-success mt-0.5">{aiInsight.confidence}%</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exp. Engagement</p>
                    <p className="font-bold text-sm mt-0.5">{aiInsight.engagement}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exp. Conversion</p>
                    <p className="font-bold text-sm mt-0.5">{aiInsight.conversion}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-accent block mb-1">AI Reasoning</span>
                  {aiInsight.reason}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Recent Campaigns Table ═══ */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Campaigns</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/50 border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign</th>
                  <th className="px-6 py-4 font-medium">Channel</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Audience</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((campaign) => {
                  const sc = statusConfig[campaign.status] || statusConfig.draft;
                  const SIcon = sc.icon;
                  return (
                    <tr key={campaign.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{campaign.goal}</div>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <div className="flex items-center gap-1.5">
                          {campaign.channel === "whatsapp" ? <MessageSquare className="w-4 h-4 text-muted-foreground" /> : campaign.channel === "email" ? <Mail className="w-4 h-4 text-muted-foreground" /> : <Smartphone className="w-4 h-4 text-muted-foreground" />}
                          {campaign.channel}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                          {sc.pulse ? (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                            </span>
                          ) : (
                            <SIcon className="w-3.5 h-3.5" />
                          )}
                          {sc.label || campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{campaign.target_audience_count?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {campaign.status === "draft" && (
                            <button onClick={() => launchCampaign(campaign.id)} disabled={launching === campaign.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success hover:bg-success hover:text-white rounded-lg transition-colors font-medium text-xs border border-success/20 disabled:opacity-50">
                              {launching === campaign.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />} Launch
                            </button>
                          )}
                          <Link href={`/campaigns/${campaign.id}/analytics`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:bg-foreground/5 rounded-lg transition-colors font-medium text-xs text-foreground">
                            <BarChart2 className="w-3.5 h-3.5 text-primary" /> Analytics
                          </Link>
                          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:bg-foreground/5 rounded-lg transition-colors font-medium text-xs text-foreground">
                            Duplicate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {campaigns.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    No campaigns created yet. Build your first campaign above.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}