"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import {
  ArrowLeft, User, MapPin, Phone, Mail, MessageSquare, Smartphone, Radio,
  ShoppingBag, Send, CheckCircle2, AlertCircle, MousePointerClick,
  Eye, RefreshCw, TrendingUp, Calendar, Sparkles
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
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
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
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    api.get(`/customers/${id}/timeline/`).then(r => setData(r.data)).catch(console.error);
  }, [id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { customer, total_spent, order_count, orders, communications } = data;
  const CIcon = channelIcon[customer.preferred_channel] || Smartphone;
  const cColor = channelColor[customer.preferred_channel] || "text-primary";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl">
      {/* Back */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      {/* Profile Hero */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar name={customer.name} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-current/20 bg-current/10 ${cColor}`}>
                  <CIcon className="w-3.5 h-3.5" /> Prefers {customer.preferred_channel}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{customer.city}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" />Age {customer.age} · {customer.gender}</span>
                {customer.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{customer.email}</span>}
                {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{customer.phone}</span>}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {[
                { label: "Total Spent", value: `₹${Number(total_spent).toLocaleString("en-IN", {maximumFractionDigits: 0})}`, color: "text-success" },
                { label: "Orders", value: order_count, color: "text-primary" },
                { label: "Campaigns Reached", value: communications.length, color: "text-accent" },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-background border border-border">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { id: "orders", label: "Order History", icon: ShoppingBag, count: order_count },
          { id: "comms", label: "Message Timeline", icon: Send, count: communications.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Order History Tab */}
      {activeTab === "orders" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No orders found for this customer.</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{order.product_category}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {order.from_campaign && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    <Sparkles className="w-3 h-3" /> From: {order.campaign_name}
                  </span>
                )}
                <span className="font-bold text-lg text-success">₹{Number(order.amount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Timeline Tab */}
      {activeTab === "comms" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {communications.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No campaign messages sent to this customer yet.</p>
            </div>
          ) : communications.map(comm => {
            const sc = statusConfig[comm.current_status] || statusConfig.sent;
            const SIcon = sc.icon;
            const ChanIcon = channelIcon[comm.channel] || Smartphone;
            return (
              <div key={comm.id} className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channelColor[comm.channel] || "text-primary"} bg-current/10`}>
                      <ChanIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{comm.campaign_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{comm.channel}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                    <SIcon className="w-3.5 h-3.5" /> {sc.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 border border-border/50 italic">
                  "{comm.personalized_message}"
                </p>
                {/* Mini event timeline */}
                <div className="flex gap-4 mt-3 flex-wrap">
                  {[
                    { label: "Sent", time: comm.sent_at },
                    { label: "Delivered", time: comm.delivered_at },
                    { label: "Opened", time: comm.opened_at },
                    { label: "Clicked", time: comm.clicked_at },
                    { label: "Converted", time: comm.converted_at },
                  ].filter(e => e.time).map((e, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{e.label}</span>
                      <span className="block opacity-60">{formatDate(e.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
