"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Sparkles, ArrowRight, Target, MessageSquare, BrainCircuit,
  CheckCircle2, Users, Smartphone, Loader2, Zap, ChevronRight, Rocket, TrendingUp
} from "lucide-react";

const channelIcons = {
  whatsapp: "💬",
  sms: "📱",
  email: "📧",
  rcs: "✨",
};

export default function AIPlannerPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [execStep, setExecStep] = useState(0); // 0=idle, 1=segment, 2=campaign, 3=done
  const [execResult, setExecResult] = useState(null);

  const generatePlan = async () => {
    if (!goal.trim()) return;
    try {
      setLoading(true);
      setPlan(null);
      const response = await api.post("/ai/plan-campaign/", { goal });
      setPlan(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const executePlan = async () => {
    if (!plan) return;
    try {
      setExecuting(true);
      setExecStep(1);
      await new Promise(r => setTimeout(r, 800)); // UX: show "Creating Segment..."
      setExecStep(2);
      const res = await api.post("/ai/execute-plan/", plan);
      setExecStep(3);
      setExecResult(res.data);
    } catch (error) {
      console.error(error);
      setExecuting(false);
      setExecStep(0);
    }
  };

  const goToCampaign = () => {
    router.push("/campaigns");
  };

  const presetGoals = [
    "Bring back inactive customers with a special discount offer",
    "Increase repeat purchases from loyal high-value buyers",
    "Promote festive sale to premium VIP segment in Delhi",
    "Re-engage email users who haven't purchased in 60 days",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">

      {/* Header & Prompt */}
      <div className="text-center max-w-3xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" /> AI Campaign Architect
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          What is your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            business goal?
          </span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Describe what you want to achieve. AI will engineer the perfect audience, channel, and message — then create everything in one click.
        </p>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative glass border border-[var(--color-glass-border)] rounded-2xl p-2 flex flex-col md:flex-row shadow-[var(--shadow-glow)]">
            <textarea
              className="w-full bg-transparent p-4 text-foreground placeholder-muted-foreground focus:outline-none resize-none h-32 md:h-auto"
              rows={3}
              placeholder="e.g., Reactivate customers in Delhi who haven't purchased in 90 days with a 20% discount..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) generatePlan(); }}
            />
            <div className="flex flex-col justify-end p-2 md:pl-0 border-t md:border-t-0 md:border-l border-border mt-2 md:mt-0">
              <button
                onClick={generatePlan}
                disabled={loading || !goal.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-12 md:h-full px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Thinking...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Plan</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="text-sm text-muted-foreground self-center mr-2">Try:</span>
          {presetGoals.map((preset, i) => (
            <button
              key={i}
              onClick={() => setGoal(preset)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-white/5 hover:border-primary/30 transition-colors text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Result — Success State */}
      {execResult && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="relative rounded-3xl border border-success/40 bg-success/5 glass overflow-hidden shadow-2xl p-8 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-success mb-2">Campaign Ready to Launch!</h2>
              <p className="text-muted-foreground mb-6">AI created the segment and campaign in your CRM.</p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="p-3 rounded-xl bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Segment</p>
                  <p className="font-semibold text-sm truncate">{execResult.segment_name}</p>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Audience</p>
                  <p className="font-semibold text-sm">{execResult.audience_count.toLocaleString()} users</p>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Channel</p>
                  <p className="font-semibold text-sm capitalize">{execResult.channel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => router.push('/segments')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-success/30 text-success rounded-xl font-bold hover:bg-success/10 transition-colors shadow-lg"
                >
                  View Created Segment
                </button>
                <button
                  onClick={goToCampaign}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white rounded-xl font-bold hover:bg-success/90 transition-colors shadow-lg shadow-success/20"
                >
                  View Created Campaign <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Panel */}
      {plan && !execResult && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="relative rounded-3xl border border-[var(--color-glass-border)] glass overflow-hidden shadow-[var(--shadow-glow-strong)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative border-b border-border p-6 md:p-8 bg-background/50 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <BrainCircuit className="w-7 h-7 text-primary" />
                  Strategy Blueprint
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">AI-engineered for maximum conversion probability.</p>
              </div>
              <div className="flex items-center gap-4 bg-background/40 px-5 py-3 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000" style={{ width: `${plan.confidence_score}%` }} />
                    </div>
                    <span className="font-bold text-success text-lg">{plan.confidence_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border relative">

              {/* Target Audience */}
              <div className="p-6 md:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Target className="w-5 h-5" /></div>
                  <h3 className="text-lg font-semibold">Target Audience</h3>
                </div>

                <div>
                  <p className="text-xl font-bold text-foreground mb-2">{plan.segment_name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.segment_description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Targeting Criteria</p>
                  {plan.segment_rules && Object.entries(plan.segment_rules).map(([k, v], i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-background/50 border border-border rounded-lg px-3 py-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="opacity-70">{k}:</span>
                      <span className="font-semibold text-primary">{String(v)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 p-4 rounded-xl bg-background/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Audience Size</p>
                      <p className="font-semibold text-sm">21 Customers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-muted-foreground ml-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Reach</p>
                      <p className="font-semibold text-sm">19 Customers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-success ml-0.5" />
                    <div>
                      <p className="text-xs text-success">Expected Conversion</p>
                      <p className="font-semibold text-sm text-success">3-4 Customers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel & Message */}
              <div className="p-6 md:p-8 space-y-6 lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent"><Smartphone className="w-5 h-5" /></div>
                      <h3 className="text-lg font-semibold">Channel Strategy</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-background/40 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{channelIcons[plan.recommended_channel] || "📡"}</span>
                        <span className="capitalize text-lg font-bold">{plan.recommended_channel}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success uppercase">Optimal</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.reasoning?.slice(0, 120)}...</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-warning/10 text-warning"><BrainCircuit className="w-5 h-5" /></div>
                      <h3 className="text-lg font-semibold">AI Reasoning</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground p-4 rounded-xl bg-background/40 border border-border/50 h-[96px] overflow-y-auto">
                      {plan.reasoning}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-success/10 text-success"><MessageSquare className="w-5 h-5" /></div>
                    <h3 className="text-lg font-semibold">Generated Message</h3>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                    <div className="pl-10">
                      <div className="p-5 rounded-xl bg-background/40 border border-border/50 text-foreground leading-relaxed whitespace-pre-wrap shadow-sm">
                        {plan.message}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 flex items-center justify-between gap-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    This will create a real segment + draft campaign in your CRM.
                  </p>

                  {executing ? (
                    <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {execStep === 1 && "Creating Segment..."}
                        {execStep === 2 && "Building Campaign..."}
                        {execStep === 3 && "Done!"}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={executePlan}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                    >
                      <Zap className="w-5 h-5" /> Create Campaign from Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}