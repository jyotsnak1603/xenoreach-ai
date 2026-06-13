"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "../../lib/api";
import {
  Search, MapPin, MessageCircle, Mail, Phone, Radio,
  MoreHorizontal, ShoppingCart, DollarSign, Users, ChevronDown,
  Eye, Package, Megaphone, Trash2, X, Sparkles, TrendingUp
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const channelConfig = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-400" },
  email:    { icon: Mail,           label: "Email",    color: "text-blue-400"    },
  sms:      { icon: Phone,          label: "SMS",      color: "text-amber-400"   },
  rcs:      { icon: Radio,          label: "RCS",      color: "text-purple-400"  },
};

const typeBadge = {
  VIP:      "bg-primary/15 text-primary border-primary/30 shadow-primary/5 shadow-sm",
  Regular:  "bg-success/15 text-success border-success/30 shadow-success/5 shadow-sm",
  Inactive: "bg-muted/10 text-muted-foreground border-border",
};

function classify(totalSpend, orderCount) {
  if (totalSpend >= 5000) return "VIP";
  if (orderCount <= 1) return "Inactive";
  return "Regular";
}

function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const avatarGradients = [
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-teal-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-lime-500",
  "from-fuchsia-500 to-violet-500",
];
function avatarGradient(id) {
  return avatarGradients[id % avatarGradients.length];
}

// ─── Dropdown Menu ────────────────────────────────────────
function ActionMenu({ onClose, onAction }) {
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const items = [
    { id: "details", icon: Eye,       label: "View Details" },
    { id: "orders",  icon: Package,   label: "View Orders" },
    { id: "history", icon: Megaphone, label: "Campaign History" },
    { id: "delete",  icon: Trash2,    label: "Delete Customer", danger: true },
  ];

  return (
    <div ref={ref} className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onAction(item.id); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
            item.danger
              ? "text-danger hover:bg-danger/10"
              : "text-foreground/80 hover:text-foreground hover:bg-white/5"
          }`}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Filter Pill ──────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeModal, setActiveModal] = useState({ type: null, customer: null });

  useEffect(() => {
    async function load() {
      try {
        const [custRes, ordRes] = await Promise.all([
          api.get("/customers/"),
          api.get("/orders/"),
        ]);
        setCustomers(custRes.data);
        setOrders(ordRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAction = async (actionId, customer) => {
    if (actionId === "delete") {
      try {
        await api.delete(`/customers/${customer.id}/`);
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      } catch (err) {
        console.error("Failed to delete customer", err);
      }
    } else {
      setActiveModal({ type: actionId, customer });
    }
  };

  // Build per-customer order aggregates
  const customerStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.customer]) map[o.customer] = { count: 0, spend: 0 };
      map[o.customer].count += 1;
      map[o.customer].spend += parseFloat(o.amount);
    });
    return map;
  }, [orders]);

  // Derive unique cities for filter
  const cities = useMemo(() => {
    const set = new Set(customers.map((c) => c.city));
    return ["All", ...Array.from(set).sort()];
  }, [customers]);

  const channels = ["All", "whatsapp", "email", "sms", "rcs"];
  const types = ["All", "VIP", "Regular", "Inactive"];

  // Filter logic
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const stats = customerStats[c.id] || { count: 0, spend: 0 };
      const cType = classify(stats.spend, stats.count);

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!c.name.toLowerCase().includes(term) && !c.city.toLowerCase().includes(term) && !c.email?.toLowerCase().includes(term))
          return false;
      }
      if (cityFilter !== "All" && c.city !== cityFilter) return false;
      if (channelFilter !== "All" && c.preferred_channel !== channelFilter) return false;
      if (typeFilter !== "All" && cType !== typeFilter) return false;
      return true;
    });
  }, [customers, customerStats, searchTerm, cityFilter, channelFilter, typeFilter]);

  const activeFilterCount = [cityFilter, channelFilter, typeFilter].filter((f) => f !== "All").length;

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length.toLocaleString()} contacts · Manage and segment your audience.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, city or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3">
        {/* City */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 w-16 shrink-0">City</span>
          {cities.map((c) => (
            <FilterPill key={c} label={c} active={cityFilter === c} onClick={() => setCityFilter(c)} />
          ))}
        </div>
        {/* Channel */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 w-16 shrink-0">Channel</span>
          {channels.map((ch) => (
            <FilterPill key={ch} label={ch === "All" ? "All" : channelConfig[ch]?.label || ch} active={channelFilter === ch} onClick={() => setChannelFilter(ch)} />
          ))}
        </div>
        {/* Type */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 w-16 shrink-0">Type</span>
          {types.map((t) => (
            <FilterPill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={() => { setCityFilter("All"); setChannelFilter("All"); setTypeFilter("All"); }}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> of {customers.length} customers
        </p>
      </div>

      {/* ── Customer Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((customer) => {
          const stats = customerStats[customer.id] || { count: 0, spend: 0 };
          const cType = classify(stats.spend, stats.count);
          const ch = channelConfig[customer.preferred_channel] || channelConfig.sms;
          const ChIcon = ch.icon;

          return (
            <div
              key={customer.id}
              className="group relative flex flex-col rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)] hover:scale-[1.02] overflow-hidden"
            >
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Avatar row */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(customer.id)} flex items-center justify-center shadow-lg ring-2 ring-white/10`}>
                      <span className="font-bold text-sm text-white drop-shadow">{initials(customer.name)}</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground leading-tight">{customer.name}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" /> {customer.city} <span className="opacity-40">·</span> Age {customer.age}
                      </div>
                    </div>
                  </div>

                  {/* Three-dot menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === customer.id ? null : customer.id); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === customer.id && <ActionMenu onClose={() => setOpenMenuId(null)} onAction={(actionId) => handleAction(actionId, customer)} />}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-background/60 rounded-xl p-3.5 border border-border/60 group-hover:border-border transition-colors">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      <ShoppingCart className="w-3 h-3" /> Orders
                    </div>
                    <div className="text-lg font-bold">{stats.count}</div>
                  </div>
                  <div className="bg-background/60 rounded-xl p-3.5 border border-border/60 group-hover:border-border transition-colors">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      <DollarSign className="w-3 h-3" /> Spend
                    </div>
                    <div className="text-lg font-bold">₹{stats.spend.toLocaleString()}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${ch.color}`}>
                    <ChIcon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${typeBadge[cType]}`}>
                    {cType}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-lg">
            <Users className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No customers found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any customers matching your current search and filter criteria.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setCityFilter("All"); setChannelFilter("All"); setTypeFilter("All"); }}
            className="mt-6 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {activeModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setActiveModal({ type: null, customer: null })}
              className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 capitalize">Customer {activeModal.type}</h2>
            <div className="space-y-3">
              <p><strong>Name:</strong> {activeModal.customer.name}</p>
              <p><strong>City:</strong> {activeModal.customer.city}</p>
              <p><strong>Email:</strong> {activeModal.customer.email}</p>
              <p><strong>Phone:</strong> {activeModal.customer.phone}</p>
              <p><strong>Channel:</strong> {activeModal.customer.preferred_channel}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button 
                onClick={() => setActiveModal({ type: null, customer: null })}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}