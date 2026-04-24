"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import handleSignup from "@/lib/actions/handleSignup";

export default function AuthPage({ signIn }: { signIn: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  interface SignupResponse {
    message: string;
    error?: string;
    status: number;
    user?: {
      email: string;
      name: string;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!signIn) {
        // Sign up: hit the backend directly first, then log in
        const response: SignupResponse = await handleSignup({ name, email, password });
        if(response.status !== 201){
          throw new Error(response.message);
        }
      }

      // Sign in (or sign in after signup) via NextAuth CredentialsProvider
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) throw new Error("Invalid email or password.");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: string){
    setLoading(true);
    setError("");
    try {
      // OAuth providers require a real redirect — use callbackUrl to land on "/" after sign-in
      await nextAuthSignIn(provider, { callbackUrl: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const features = [
    { icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" />, text: "Real-time multiplayer collaboration" },
    { icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />, text: "Infinite canvas with rich drawing tools" },
    { icon: <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7zM13 2v7h7" />, text: "Auto-saved history & version control" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080815] text-white flex">

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-52 -left-52 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Extra glow inside panel */}
        <div className="absolute bottom-20 -left-10 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">SketchSync</span>
        </Link>

        {/* Headline + features */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Think together,{" "}
            <span className="animate-shimmer">build faster</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            A real-time collaborative whiteboard that turns scattered ideas into clear, shared understanding.
          </p>

          <ul className="space-y-4">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
                  <svg className="text-purple-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <span className="text-sm text-gray-300">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mini mockup */}
        <div className="relative animate-float">
          <div className="rounded-2xl border border-white/10 bg-[#0e0e1e]/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40 max-w-md">
            {/* Chrome bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-[#111124]">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <div className="ml-3 flex items-center gap-1.5 rounded bg-white/5 px-3 py-0.5 text-[10px] text-gray-500">
                app.sketchsync.io/room/design-sprint
              </div>
            </div>
            {/* Canvas preview */}
            <div className="relative h-40 bg-[#0a0a18]">
              <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="d2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#6366f1" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#d2)" />
              </svg>
              <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="18" width="110" height="70" rx="7" fill="#7c3aed" fillOpacity="0.2" stroke="#7c3aed" strokeWidth="1.5" />
                <text x="75" y="52" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="sans-serif" fontWeight="600">Sprint Goals</text>
                <text x="75" y="68" textAnchor="middle" fill="#a78bfa" fontSize="8.5" fontFamily="sans-serif">Ship v2 this week</text>
                <rect x="148" y="14" width="100" height="60" rx="7" fill="#0ea5e9" fillOpacity="0.18" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="198" y="48" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="sans-serif" fontWeight="600">Tech Stack</text>
                <text x="198" y="63" textAnchor="middle" fill="#93c5fd" fontSize="8.5" fontFamily="sans-serif">Next.js · WS</text>
                <path d="M 130 55 C 138 55 140 45 148 45" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
                <path className="animate-draw" d="M 30 115 Q 100 98 180 112 Q 240 122 310 105" stroke="#818cf8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
              {/* Cursor */}
              <div className="absolute" style={{ left: 195, top: 90 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#a855f7"><path d="M4 2l16 9-9 2-3 9z" /></svg>
                <span className="rounded-full bg-purple-600 px-1.5 py-0.5 text-[9px] text-white">Alex</span>
              </div>
              {/* Online pill */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111124]/80 px-2.5 py-1 text-[10px] text-gray-400">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>
                3 online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — FORM ══════════ */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-14">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile-only logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">SketchSync</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {signIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {signIn
                ? "Sign in to continue to your workspace."
                : "Start collaborating with your team for free."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name — signup only */}
              {!signIn && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Full name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Kim"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Email address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5">
                  <label className="text-xs font-medium text-gray-400">Password</label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={signIn ? "Your password" : "Min. 8 characters"}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    {signIn ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {signIn ? "Sign in to SketchSync" : "Create free account"}
                    <svg className="transition-transform group-hover:translate-x-1" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {signIn && (
                <div className="text-center">
                  <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs text-gray-600">or continue with</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* OAuth placeholder */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  name: "Google",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ),
                },
                {
                  name: "GitHub",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  ),
                },
              ].map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
                  onClick={() => handleOAuthSignIn(provider.name.toLowerCase())}
                >
                  {provider.icon}
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {/* Switch link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {signIn ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={signIn ? "/signup" : "/signin"}
              className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              {signIn ? "Sign up for free" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}