"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { Sparkles, Users, Activity, Plus, Target, X, Eye, ChevronRight, Zap } from "lucide-react";

export default function SegmentsPage() {
  const router = useRouter();
  const [segments, setSegments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSegmentDrawer, setActiveSegmentDrawer] = useState(null);
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
      setIsCreateModalOpen(false);
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" /> Audience Segments
          </h1>
          <p className="text-muted-foreground mt-1">Target the right people with AI-powered segmentation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/ai-planner")}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-glass)] border border-[var(--color-glass-border)] text-foreground rounded-lg hover:border-primary/50 transition-colors font-medium shadow-sm backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-accent" /> Generate with AI
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-[var(--shadow-glow)]"
          >
            <Plus className="w-4 h-4" /> Create Segment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {segments.map((segment, index) => {
          // Real counts from the backend serializer
          const audienceSize = segment.audience_count || 0;
          const estimatedReach = Math.floor(audienceSize * 0.85);
          const ruleBadges = formatRules(segment.rules_json);
          const isTopPerforming = index === 0; // Just simulating top performing on the first one

          return (
            <div 
              key={segment.id} 
              onClick={() => setActiveSegmentDrawer(segment)}
              className="relative group p-6 rounded-2xl glass cursor-pointer hover:border-primary/50 transition-all hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative">
                <div className="pr-12">
                  <h2 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                    {segment.name}
                    {isTopPerforming && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-warning/10 text-warning px-2 py-0.5 rounded-full border border-warning/20">
                        <Zap className="w-3 h-3" /> Top Performer
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{segment.description}</p>
                </div>
                {segment.created_by_ai && (
                  <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-accent group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mt-2 mb-6 relative">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Targeting Rules</p>
                <div className="flex flex-wrap gap-2">
                  {ruleBadges.length > 0 ? ruleBadges.map((rule, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold font-mono text-foreground/80 shadow-sm">
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
                  <div className="p-2 rounded-xl bg-background border border-border">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Audience Size</p>
                    <p className="font-bold text-lg leading-tight">{audienceSize.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-background border border-border">
                    <Activity className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Reach</p>
                    <p className="font-bold text-lg leading-tight">{estimatedReach.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Segment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass border border-[var(--color-glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Create New Segment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Segment Name</label>
                <input 
                  type="text" 
                  value={newSegment.name}
                  onChange={e => setNewSegment({...newSegment, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="e.g. VIP Delhi Customers"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={newSegment.description}
                  onChange={e => setNewSegment({...newSegment, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none h-24 resize-none"
                  placeholder="What is this segment used for?"
                  required
                />
              </div>
              <div className="pt-4 border-t border-border/50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-background hover:bg-foreground/5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Details Drawer / Modal */}
      {activeSegmentDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full glass border-l border-[var(--color-glass-border)] shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {activeSegmentDrawer.created_by_ai ? <Sparkles className="w-5 h-5 text-accent" /> : <Target className="w-5 h-5 text-primary" />}
                Segment Details
              </h2>
              <button 
                onClick={() => setActiveSegmentDrawer(null)}
                className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">{activeSegmentDrawer.name}</h3>
                <p className="text-muted-foreground">{activeSegmentDrawer.description}</p>
                {activeSegmentDrawer.created_by_ai && (
                  <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                    <Sparkles className="w-3.5 h-3.5" /> AI Generated Audience
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Audience</p>
                  <p className="text-2xl font-bold">{activeSegmentDrawer.audience_count?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Est. Reach</p>
                  <p className="text-2xl font-bold text-success">{Math.floor((activeSegmentDrawer.audience_count || 0) * 0.85).toLocaleString()}</p>
                </div>
                <div className="col-span-2 p-4 rounded-xl bg-background border border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Conversion Potential</p>
                    <p className="text-lg font-bold text-primary">High</p>
                  </div>
                  <Zap className="w-6 h-6 text-warning" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Logic Rules</h4>
                <div className="bg-background border border-border rounded-xl p-4 font-mono text-sm space-y-2">
                  {formatRules(activeSegmentDrawer.rules_json).map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground/80">
                      <span className="text-primary font-bold">✓</span> {rule}
                    </div>
                  ))}
                  {(!activeSegmentDrawer.rules_json || Object.keys(activeSegmentDrawer.rules_json).length === 0) && (
                    <span className="text-muted-foreground">No specific filtering rules.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-md space-y-3">
              <button 
                onClick={() => {
                  setActiveSegmentDrawer(null);
                  router.push(`/customers?segment=${activeSegmentDrawer.id}`);
                }}
                className="w-full py-3 rounded-xl bg-background border border-border hover:border-primary hover:text-primary transition-colors font-bold flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Preview Audience
              </button>
              <button 
                onClick={() => {
                  setActiveSegmentDrawer(null);
                  router.push(`/campaigns?segment=${activeSegmentDrawer.id}`);
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground transition-colors font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-glow)]"
              >
                Use in Campaign <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}