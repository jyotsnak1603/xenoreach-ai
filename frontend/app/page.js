"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Shield, Zap, Target, BarChart3, Users, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      
      {/* --- Navigation --- */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              XenoReach AI
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-accent to-purple-600 blur-[120px] animate-pulse-slow" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Introducing XenoReach AI 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Automate Your Growth with <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI-Powered CRM
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Identify high-value leads, generate personalized outreach campaigns, and close more deals. All fully automated by state-of-the-art AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link 
              href="/signup" 
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-semibold hover:scale-105 transition-all shadow-xl hover:shadow-primary/20"
            >
              Start Building Campaigns <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#demo" 
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-border font-semibold hover:bg-white/10 transition-all"
            >
              View Demo
            </a>
          </div>
        </div>

        {/* Dashboard Preview Image (Mock) */}
        <div className="mt-20 max-w-5xl mx-auto relative z-20">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          <div className="glass rounded-xl border border-border/50 p-2 shadow-2xl relative overflow-hidden bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="aspect-video bg-black/40 flex items-center justify-center relative overflow-hidden">
              {/* Abstract UI Representation */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <BarChart3 className="w-24 h-24 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="py-24 px-6 bg-black/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for modern marketing and sales teams who want to leverage AI for hyper-personalized outreach.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Smart Segmentation",
                desc: "AI automatically identifies your most profitable audience segments based on historical data."
              },
              {
                icon: Zap,
                title: "Predictive Lead Scoring",
                desc: "Never guess who to call next. Our AI scores leads from 0-100 and predicts conversion probability."
              },
              {
                icon: MessageSquare,
                title: "Omnichannel Campaigns",
                desc: "Launch personalized campaigns across WhatsApp, SMS, and Email with a single click."
              },
              {
                icon: Users,
                title: "Multi-User Workspaces",
                desc: "Collaborate seamlessly. Sales and marketing teams have their own isolated views and data."
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Your data is encrypted and protected with industry-standard JWT authentication and RBAC."
              },
              {
                icon: BarChart3,
                title: "Advanced Reporting",
                desc: "Real-time analytics and funnel tracking to measure the exact ROI of your campaigns."
              }
            ].map((feature, i) => (
              <div key={i} className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your sales engine?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join forward-thinking companies using XenoReach AI to automate their growth.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-105"
          >
            Start your free trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight">XenoReach AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 XenoReach Inc. All rights reserved. Built for scale.
          </p>
        </div>
      </footer>
    </div>
  );
}