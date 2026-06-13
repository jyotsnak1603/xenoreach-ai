"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Search, MapPin, MessageCircle, Mail, Phone, Radio,
  MoreHorizontal, ShoppingCart, DollarSign, Users,
  Eye, Package, Megaphone, Trash2, X, TrendingUp, Filter, ArrowUpDown
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const channelConfig = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-400" },
  email:    { icon: Mail,           label: "Email",    color: "text-blue-400"    },
  sms:      { icon: Phone,          label: "SMS",      color: "text-amber-400"   },
  rcs:      { icon: Radio,          label: "RCS",      color: "text-purple-400"  },
};

const typeBadge = {
  VIP:      "bg-primary/15 text-primary border-primary/30 shadow-primary/5",
  Regular:  "bg-success/15 text-success border-success/30 shadow-success/5",
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
    { id: "details", icon: Eye,       label: "View Profile" },
    { id: "orders",  icon: Package,   label: "Orders" },
    { id: "history", icon: Megaphone, label: "Campaign History" },
    { id: "delete",  icon: Trash2,    label: "Delete Customer", danger: true },
  ];

  return (
    <div ref={ref} className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass)] backdrop-blur-xl shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onAction(item.id); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
            item.danger
              ? "text-danger hover:bg-danger/10"
              : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
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
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // newest, spend, orders
  const [openMenuId, setOpenMenuId] = useState(null);

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
    if (actionId === "details" || actionId === "orders" || actionId === "history") {
      router.push(`/customers/${customer.id}`);
    } else if (actionId === "delete") {
      try {
        await api.delete(`/customers/${customer.id}/`);
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      } catch (err) {
        console.error("Failed to delete customer", err);
      }
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

  // Aggregate top-level stats
  const headerStats = useMemo(() => {
    let totalSpend = 0;
    let vipCount = 0;
    customers.forEach(c => {
      const stats = customerStats[c.id] || { count: 0, spend: 0 };
      totalSpend += stats.spend;
      if (classify(stats.spend, stats.count) === "VIP") vipCount++;
    });
    return {
      total: customers.length,
      spend: totalSpend,
      vip: vipCount
    };
  }, [customers, customerStats]);

  // Derive unique cities for filter
  const cities = useMemo(() => {
    const set = new Set(customers.map((c) => c.city));
    return ["All", ...Array.from(set).sort()];
  }, [customers]);

  const channels = ["All", "whatsapp", "email", "sms", "rcs"];
  const types = ["All", "VIP", "Regular", "Inactive"];

  // Filter and Sort logic
  const filtered = useMemo(() => {
    let result = customers.filter((c) => {
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

    result.sort((a, b) => {
      const statsA = customerStats[a.id] || { count: 0, spend: 0 };
      const statsB = customerStats[b.id] || { count: 0, spend: 0 };
      
      if (sortBy === "spend") return statsB.spend - statsA.spend;
      if (sortBy === "orders") return statsB.count - statsA.count;
      return b.id - a.id; // newest
    });

    return result;
  }, [customers, customerStats, searchTerm, cityFilter, channelFilter, typeFilter, sortBy]);

  const activeFilterCount = [cityFilter, channelFilter, typeFilter].filter((f) => f !== "All").length;

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="h-5 w-72 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="h-24 skeleton" />
           <div className="h-24 skeleton" />
           <div className="h-24 skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* ── Header & Top Stats ── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage and analyze your shopper database.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 glass rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
              <h2 className="text-2xl font-bold mt-1">{headerStats.total.toLocaleString()}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Lifetime Spend</p>
              <h2 className="text-2xl font-bold mt-1 text-success">₹{headerStats.spend.toLocaleString()}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">VIP Audience</p>
              <h2 className="text-2xl font-bold mt-1">{headerStats.vip.toLocaleString()}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Sorting ── */}
      <div className="glass p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {cities.map((c) => (
              <FilterPill key={c} label={c} active={cityFilter === c} onClick={() => setCityFilter(c)} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-5 mr-1" /> {/* Spacer */}
            {channels.map((ch) => (
              <FilterPill key={ch} label={ch === "All" ? "All Channels" : channelConfig[ch]?.label || ch} active={channelFilter === ch} onClick={() => setChannelFilter(ch)} />
            ))}
            <div className="w-px h-4 bg-border mx-2" />
            {types.map((t) => (
              <FilterPill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
            ))}
            {activeFilterCount > 0 && (
              <button onClick={() => { setCityFilter("All"); setChannelFilter("All"); setTypeFilter("All"); }} className="text-xs text-primary ml-2 hover:underline">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 border-l border-border/50 pl-4">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-card text-foreground">Sort by Newest</option>
            <option value="spend" className="bg-card text-foreground">Highest Spend</option>
            <option value="orders" className="bg-card text-foreground">Most Orders</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing <span className="text-foreground font-semibold">{filtered.length}</span> results
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
              onClick={() => router.push(`/customers/${customer.id}`)}
              className="group relative flex flex-col rounded-2xl glass cursor-pointer transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(customer.id)} flex items-center justify-center shadow-lg ring-2 ring-white/10`}>
                      <span className="font-bold text-sm text-white drop-shadow">{initials(customer.name)}</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{customer.name}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" /> {customer.city}
                      </div>
                    </div>
                  </div>

                  {/* Three-dot menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === customer.id ? null : customer.id); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === customer.id && <ActionMenu onClose={() => setOpenMenuId(null)} onAction={(actionId) => handleAction(actionId, customer)} />}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-background/60 rounded-xl p-3 border border-border/60 group-hover:border-border transition-colors">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                      <ShoppingCart className="w-3 h-3" /> Orders
                    </div>
                    <div className="text-lg font-bold">{stats.count}</div>
                  </div>
                  <div className="bg-background/60 rounded-xl p-3 border border-border/60 group-hover:border-border transition-colors">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
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
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${typeBadge[cType]}`}>
                    {cType}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass flex flex-col items-center justify-center py-24 text-center rounded-2xl">
          <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center mb-5 shadow-lg">
            <Users className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold mb-1">No customers found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Adjust your filters or search term to find what you're looking for.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setCityFilter("All"); setChannelFilter("All"); setTypeFilter("All"); }}
            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}