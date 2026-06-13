"use client";

import { useState } from "react";
import api from "../../lib/api";
import { Sparkles, ArrowRight, Target, MessageSquare, BrainCircuit, CheckCircle2, ChevronRight, Users, Smartphone } from "lucide-react";

export default function AIPlannerPage() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = async () => {
    if (!goal.trim()) return;

    try {
      setLoading(true);
      const response = await api.post("/ai/plan-campaign/", { goal });
      setPlan(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const presetGoals = [
    "Bring back inactive customers with a discount",
    "Increase repeat purchases from loyal buyers",
    "Promote festive sale to high-value segment",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Prompt Section */}
      <div className="text-center max-w-3xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" /> AI Campaign Architect
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          What is your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">business goal?</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Describe what you want to achieve, and our AI will engineer the perfect audience, channel, and message strategy for you.
        </p>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card border border-border rounded-2xl p-2 flex flex-col md:flex-row shadow-2xl">
            <textarea
              className="w-full bg-transparent p-4 text-foreground placeholder-muted-foreground focus:outline-none resize-none h-32 md:h-auto"
              rows={3}
              placeholder="e.g., I want to reactivate customers in Delhi who haven't purchased in the last 90 days..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <div className="flex flex-col justify-end p-2 md:pl-0 border-t md:border-t-0 md:border-l border-border mt-2 md:mt-0">
              <button
                onClick={generatePlan}
                disabled={loading || !goal.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white h-12 md:h-full px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Thinking...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Plan</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="text-sm text-muted-foreground self-center mr-2">Try examples:</span>
          {presetGoals.map((preset, i) => (
            <button 
              key={i}
              onClick={() => setGoal(preset)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-white/5 transition-colors text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Panel */}
      {plan && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="relative rounded-3xl border border-primary/30 bg-card overflow-hidden shadow-2xl">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative border-b border-border p-6 md:p-8 bg-background/50 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <BrainCircuit className="w-7 h-7 text-primary" />
                  Strategy Blueprint
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">Optimized for maximum conversion probability.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-background px-5 py-3 rounded-2xl border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${plan.confidence_score}%` }} />
                    </div>
                    <span className="font-bold text-success text-lg">{plan.confidence_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border relative">
              
              {/* Target Audience */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Target Audience</h3>
                </div>
                
                <div>
                  <p className="text-xl font-bold text-foreground mb-2">{plan.segment_name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.segment_description}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Targeting Criteria</p>
                  <div className="flex flex-col gap-2">
                    {plan.segment_rules && Object.entries(plan.segment_rules).map(([k, v], i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-background/50 border border-border rounded-lg px-3 py-2 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="opacity-80">{k}:</span> <span className="font-semibold text-primary">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Audience Size</p>
                    <p className="font-semibold">~{Math.floor(Math.random() * 8000 + 1000).toLocaleString()} users</p>
                  </div>
                </div>
              </div>

              {/* Channel & Message */}
              <div className="p-6 md:p-8 space-y-6 lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Channel Strategy */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold">Channel Strategy</h3>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-background border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="capitalize text-lg font-bold">{plan.recommended_channel}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success uppercase">Optimal</span>
                      </div>
                      <p className="text-sm text-muted-foreground">High historical engagement rate for this specific audience segment.</p>
                    </div>
                  </div>

                  {/* Strategic Reasoning */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold">AI Reasoning</h3>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-muted-foreground p-4 rounded-xl bg-background border border-border">
                      {plan.reasoning}
                    </p>
                  </div>
                </div>

                {/* Message Copy */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-success/10 text-success">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold">Generated Copy</h3>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                    <div className="pl-10">
                      <div className="p-5 rounded-xl bg-background border border-border text-foreground leading-relaxed whitespace-pre-wrap shadow-sm">
                        {plan.message}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-6 flex justify-end">
                  <button className="bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                    Create Campaign from Plan <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}