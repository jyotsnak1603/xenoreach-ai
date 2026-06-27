"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Building, ArrowRight, Loader2 } from "lucide-react";
import api from "../../lib/api";
import { setToken, setUserData } from "../../lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        username: formData.email.split("@")[0] + Math.floor(Math.random() * 1000),
      };
      
      const response = await api.post("/auth/register/", payload);
      const { access, refresh, user } = response.data;
      
      setToken(access, refresh);
      setUserData(user);
      
      router.push("/dashboard");
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === "object") {
        const firstError = Object.values(errData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-card/30 via-background to-background flex flex-col items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 my-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create an Account</h1>
          <p className="text-muted-foreground">Start automating your marketing with AI</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
          
          <form onSubmit={handleSignup} className="space-y-4 relative z-10">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">First Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Company (Optional)</label>
              <div className="relative group">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    name="password2"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className="w-full bg-black/20 dark:bg-black/40 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
