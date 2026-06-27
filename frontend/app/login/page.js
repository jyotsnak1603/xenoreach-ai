"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import api from "../../lib/api";
import { setToken, setUserData } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = response.data;
      
      setToken(access, refresh);
      setUserData(user);
      
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-card/30 via-background to-background flex flex-col items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your XenoReach AI workspace</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
          
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email or Username</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  placeholder="marketer@xenoreach.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/80">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create an account
          </Link>
        </p>
        
        {/* Demo hints */}
        <div className="mt-12 p-4 glass rounded-xl border border-border/50 text-xs text-muted-foreground text-center animate-in fade-in duration-1000 delay-500">
          <p className="font-semibold text-foreground/80 mb-1">Demo Credentials:</p>
          <p>Email: <span className="text-primary">marketer@xenoreach.ai</span></p>
          <p>Password: <span className="text-primary">password123</span></p>
        </div>
      </div>
    </div>
  );
}
