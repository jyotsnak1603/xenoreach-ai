"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-card/30 via-background to-background flex flex-col items-center justify-center p-4">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you instructions to reset your password</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
          
          {submitted ? (
            <div className="text-center py-4 relative z-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4 border border-success/30">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We've sent a password reset link to <br/><span className="font-medium text-foreground">{email}</span>
              </p>
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-95 mt-2"
              >
                Send Reset Link <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {!submitted && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
