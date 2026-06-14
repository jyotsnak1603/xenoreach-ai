"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import {
  ArrowLeft, User, MapPin, Phone, Mail, MessageSquare, Smartphone, Radio,
  ShoppingBag, Send, CheckCircle2, AlertCircle, MousePointerClick,
  Eye, RefreshCw, TrendingUp, Calendar, Sparkles, Target, Zap, Activity
} from "lucide-react";

const channelIcon = { whatsapp: MessageSquare, sms: Smartphone, email: Mail, rcs: Radio };
const channelColor = { whatsapp: "text-emerald-400", sms: "text-amber-400", email: "text-blue-400", rcs: "text-purple-400" };

const statusConfig = {
  created:   { label: "Created",   color: "bg-muted/20 text-muted-foreground",    icon: RefreshCw },
  sent:      { label: "Sent",      color: "bg-blue-500/10 text-blue-400",          icon: Send },
  delivered: { label: "Delivered", color: "bg-primary/10 text-primary",            icon: CheckCircle2 },
  failed:    { label: "Failed",    color: "bg-danger/10 text-danger",              icon: AlertCircle },
  opened:    { label: "Opened",    color: "bg-accent/10 text-accent",              icon: Eye },
  clicked:   { label: "Clicked",   color: "bg-warning/10 text-warning",            icon: MousePointerClick },
  converted: { label: "Converted", color: "bg-success/10 text-success",            icon: TrendingUp },
};

function Avatar({ name }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["from-violet-500 to-indigo-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
  const color = colors[name?.charCodeAt(0) % colors.length];
  return (
    <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-br ${color} flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-2xl ring-4 ring-background shrink-0`}>
      {initials}
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("comms"); // default to timeline

  useEffect(() => {
    api.get(`/customers/${id}/timeline/`).then(r => setData(r.data)).catch(console.error);
  }, [id]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading customer intelligence...</p>
      </div>
    );
  }

  const { customer, total_spent, order_count, orders, communications } = data;
  const CIcon = channelIcon[customer.preferred_channel] || Smartphone;
  const cColor = channelColor[customer.preferred_channel] || "text-primary";

  // Simulate Health Score based on engagement
  const convertedComms = communications.filter(c => c.current_status === 'converted').length;
  const healthScore = Math.min(100, 50 + (order_count * 5) + (convertedComms * 10));

  // Determine VIP Status
  let segmentLabel = "Regular";
  if (total_spent >= 5000) segmentLabel = "VIP Customer";
  else if (order_count === 0) segmentLabel = "Inactive";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      {/* Back */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Customers
      </Link>

      {/* ── Flagship Profile Hero ── */}
      <div className="relative rounded-3xl glass overflow-hidden shadow-[var(--shadow-glow)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative p-6 md:p-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1 text-center md:text-left">
            <Avatar name={customer.name} />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{customer.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-current/20 bg-current/10 ${cColor} shadow-sm`}>
                  <CIcon className="w-3.5 h-3.5" /> Prefers {customer.preferred_channel}
                </span>
                {segmentLabel === "VIP Customer" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/30 bg-primary/20 text-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                    <Sparkles className="w-3.5 h-3.5" /> VIP
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/70" />{customer.city}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary/70" />Age {customer.age} · {customer.gender}</span>
                {customer.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary/70" />{customer.email}</span>}
                {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-primary/70" />{customer.phone}</span>}
              </div>
            </div>
          </div>

          {/* Radial Health Score & Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-row gap-4 w-full xl:w-auto shrink-0">
            {/* Radial Score (Simulated UI) */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-background/50 border border-border col-span-2 md:col-span-1">
              <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} className="text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                </svg>
                <span className="absolute text-sm font-bold">{healthScore}</span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Health Score</p>
            </div>

            {[
              { label: "Total Spent", value: `₹${Number(total_spent).toLocaleString("en-IN", {maximumFractionDigits: 0})}`, color: "text-success", icon: TrendingUp },
              { label: "Orders", value: order_count, color: "text-foreground", icon: ShoppingBag },
              { label: "Reach", value: communications.length, color: "text-accent", icon: Target },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-background/50 border border-border">
                <s.icon className={`w-5 h-5 mb-2 opacity-50 ${s.color}`} />
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Intelligence Layer ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Insight Card */}
        <div className="glass rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">AI Customer Insight</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              This customer is highly responsive to <strong>{customer.preferred_channel}</strong> campaigns containing discount triggers. 
              {order_count > 0 ? ` They typically purchase in the ${orders[0]?.product_category || 'general'} category.` : ' No purchase history yet, ripe for a welcome offer.'}
            </p>
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Confidence</span>
              <span className="text-xs font-bold text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 92%</span>
            </div>
          </div>
        </div>

        {/* Segment Memberships */}
        <div className="glass rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Segment Memberships</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium">{customer.city} Shoppers</span>
            <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium capitalize">{customer.preferred_channel} Audience</span>
            {total_spent > 0 && <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium">Paying Customers</span>}
            {segmentLabel === "VIP Customer" && <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium">High Value (VIP)</span>}
          </div>
        </div>
      </div>

      {/* ── Tabs & Content ── */}
      <div className="glass rounded-3xl overflow-hidden shadow-lg border border-border">
        {/* Tab Headers */}
        <div className="flex gap-2 border-b border-border/50 bg-background/20 px-6 pt-6">
          {[
            { id: "comms", label: "Communication Timeline", icon: Activity, count: communications.length },
            { id: "orders", label: "Order History", icon: ShoppingBag, count: order_count },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-t-lg"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-md bg-background border border-border text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6">
          
          {/* Timeline Tab */}
          {activeTab === "comms" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {communications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-lg">No communications yet</p>
                  <p className="text-muted-foreground text-sm mt-1">Start by launching a campaign for this customer.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-border/50 ml-4 md:ml-8 space-y-10 pb-4">
                  {communications.map((comm, idx) => {
                    const sc = statusConfig[comm.current_status] || statusConfig.sent;
                    const SIcon = sc.icon;
                    const ChanIcon = channelIcon[comm.channel] || Smartphone;
                    
                    return (
                      <div key={comm.id} className="relative pl-8 md:pl-12">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-[var(--color-glass)] ${sc.color.split(' ')[0]} ${sc.color.split(' ')[1]} flex items-center justify-center shadow-lg`}>
                          <SIcon className="w-3.5 h-3.5 text-current" />
                        </div>

                        {/* Content Card */}
                        <div className="bg-background/40 border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-sm group">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <ChanIcon className={`w-4 h-4 ${channelColor[comm.channel]}`} />
                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{comm.campaign_name}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(comm.sent_at)}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current/10 ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>

                          <div className="bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-xl p-4 mb-4 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-l-xl" />
                            <p className="text-sm text-muted-foreground leading-relaxed italic ml-2">"{comm.personalized_message}"</p>
                          </div>

                          {/* Branching Event Flow */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                            {[
                              { id: "sent", label: "Sent", time: comm.sent_at, icon: Send },
                              { id: "delivered", label: "Deliv", time: comm.delivered_at, icon: CheckCircle2 },
                              { id: "opened", label: "Open", time: comm.opened_at, icon: Eye },
                              { id: "clicked", label: "Click", time: comm.clicked_at, icon: MousePointerClick },
                              { id: "converted", label: "Conv", time: comm.converted_at, icon: TrendingUp },
                            ].filter(e => e.time).map((e, i, arr) => (
                              <div key={i} className="flex items-center">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-background px-2 py-1 rounded-md border border-border text-muted-foreground">
                                  <e.icon className="w-3 h-3" />
                                  {e.label}
                                </div>
                                {i < arr.length - 1 && <div className="w-3 h-px bg-border mx-1" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {orders.length === 0 ? (
                <div className="col-span-2 py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-lg">No orders yet</p>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="flex flex-col p-5 rounded-2xl bg-background/40 border border-border hover:border-primary/20 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
                        <ShoppingBag className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-bold">{order.product_category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{String(order.id).slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xl text-foreground">₹{Number(order.amount).toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(order.order_date)}</span>
                    {order.from_campaign && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
                        <Sparkles className="w-3 h-3" /> Attributed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
