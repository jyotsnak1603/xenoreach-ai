"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Sparkles, Users, Activity, Plus } from "lucide-react";

export default function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({ name: "", description: "" });

  const loadSegments = () => {
    api.get("/segments/")
      .then((res) => setSegments(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/segments/", {
        ...newSegment,
        rules_json: { city: "Delhi" }, // Simple default rule for demo
        created_by_ai: false
      });
      setIsModalOpen(false);
      setNewSegment({ name: "", description: "" });
      loadSegments();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to convert JSON rules to readable badges
  const formatRules = (rulesObj) => {
    if (!rulesObj) return [];
    return Object.entries(rulesObj).map(([key, value]) => {
      let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let operator = "=";
      if (key.includes('_gt')) {
        displayKey = displayKey.replace(' Gt', '');
        operator = ">";
      } else if (key.includes('_lt')) {
        displayKey = displayKey.replace(' Lt', '');
        operator = "<";
      }
      return `${displayKey} ${operator} ${value}`;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audience Segments</h1>
          <p className="text-muted-foreground mt-1">Target the right people with AI-powered segmentation.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((segment) => {
          // Real counts from the backend serializer
          const audienceSize = segment.audience_count || 0;
          const estimatedReach = Math.floor(audienceSize * 0.85);

          const ruleBadges = formatRules(segment.rules_json);

          return (
            <div key={segment.id} className="relative group p-6 rounded-2xl border border-border bg-card hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/5 overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">{segment.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{segment.description}</p>
                </div>
                {segment.created_by_ai && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> Created by AI
                  </div>
                )}
              </div>

              <div className="mt-2 mb-6 relative">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Targeting Rules</p>
                <div className="flex flex-wrap gap-2">
                  {ruleBadges.length > 0 ? ruleBadges.map((rule, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium font-mono text-foreground/80">
                      {rule}
                    </span>
                  )) : (
                    <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-muted-foreground">
                      No specific rules
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border/50 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Audience Size</p>
                    <p className="font-semibold">{audienceSize.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Reach</p>
                    <p className="font-semibold">{estimatedReach.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Segment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4">Create New Segment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Segment Name</label>
                <input
                  type="text"
                  required
                  value={newSegment.name}
                  onChange={e => setNewSegment({...newSegment, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Inactive Delhi Customers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea
                  required
                  value={newSegment.description}
                  onChange={e => setNewSegment({...newSegment, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 h-24 resize-none"
                  placeholder="Customers who haven't ordered recently..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-background border border-border font-medium hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  Create Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}