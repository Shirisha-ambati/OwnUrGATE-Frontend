import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Zap, BarChart3, Cloud } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const FEATURES = [
  { icon: BookOpen, label: "Smart Question Bank", desc: "LaTeX rendering + screenshot uploads" },
  { icon: Zap, label: "GATE Exam Simulator", desc: "Official UI with accurate marking rules" },
  { icon: BarChart3, label: "Deep Analytics", desc: "Track subject-wise progress" },
  { icon: Cloud, label: "Cloud-Synced Data", desc: "MongoDB persistence — data never lost" },
];

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth();
  if (user) return <Navigate to="/" replace />;

  // Mount Google Identity Services button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err: any) {
            console.error("Google login error:", err);
            alert(`Google login failed: ${err.message || "Please check backend connectivity."}`);
          }
        },
      });
      (window as any).google?.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: 320, text: "signin_with" }
      );
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        <div className="absolute inset-0 bg-mesh-glow pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center shadow-glow border border-white/20 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">OwnUrGATE</div>
              <div className="text-text-muted text-sm">Your Personal GATE Prep Portal</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-text-primary mb-2 leading-tight">
            Crack GATE with<br />
            <span className="text-brand-blue">precision practice.</span>
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Build your question bank, simulate GATE exams with official rules, render LaTeX math, and analyze your preparation readiness. Your data is safely stored in the cloud.
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-brand-blue" />
                </div>
                <div>
                  <div className="text-text-primary text-sm font-medium">{label}</div>
                  <div className="text-text-muted text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Google Sign-In (Real) — only shown when VITE_GOOGLE_CLIENT_ID is set */}
          {GOOGLE_CLIENT_ID ? (
            <div className="mb-3">
              <div id="google-signin-btn" className="w-full" />
            </div>
          ) : (
            <button
              onClick={login}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 shadow-glow hover:shadow-glow transition-all mb-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google (Dev Mode)
            </button>
          )}

          <p className="text-center text-text-muted text-xs mt-2">
            {GOOGLE_CLIENT_ID
              ? "Sign in with your Google account. Your data is safely stored in MongoDB."
              : "Dev mode — no real login required. Add VITE_GOOGLE_CLIENT_ID to enable real Google login."}
          </p>
        </div>
      </div>

      {/* Right Panel — Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={heroBg} alt="GATE preparation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-bg-primary/20 to-bg-primary" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="glass-card p-5 backdrop-blur-md bg-bg-secondary/80">
            <div className="text-text-muted text-xs uppercase tracking-widest font-semibold mb-2">Sample GATE Question</div>
            <div className="text-text-primary text-sm leading-relaxed font-mono">
              T(n) = 2T(n/2) + n·log n → <span className="text-brand-blue font-bold">Θ(n log² n)</span>
            </div>
            <div className="mt-2 text-text-muted text-xs">Master Theorem · Case 2 · Algorithms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
