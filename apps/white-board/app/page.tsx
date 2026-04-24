import { getServerSession } from "next-auth";
import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {

  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080815] text-white">
      {/* ── Global ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="animate-pulse-glow absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px]" />
        <div className="animate-pulse-glow absolute top-1/2 -right-60 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" style={{ animationDelay: "2s" }} />
        <div className="animate-pulse-glow absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-sky-600/15 blur-[140px]" style={{ animationDelay: "1s" }} />
        <div className="grid-bg absolute inset-0 opacity-100" />
      </div>

      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 md:px-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SketchSync</span>
        </div>

        {/* Links */}
        <div className="hidden items-center gap-8 md:flex">
          {["Features", "How it works", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm text-gray-400 transition-colors hover:text-white">
              {item}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {(!session) ? (
            <>
              <Link href="/signin"
                className="hidden rounded-lg px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white md:block">
                Sign in
              </Link>
              <Link href={"/signup"}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105">
                Get Started Free
              </Link>
            </>
          )
           : (
            <ProfileDropdown
              name={session.user.name}
              email={session.user.email}
            />
          ) }
        </div>
      </nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative flex flex-col items-center px-6 pt-20 pb-8 text-center md:pt-28">
        {/* Badge */}
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
          </span>
          Real-time collaboration · Now in beta
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up-delay-1 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
          Where great ideas{" "}
          <span className="animate-shimmer">come to life</span>
        </h1>

        <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-gray-400 md:text-xl">
          A blazing-fast collaborative whiteboard. Sketch, diagram, and brainstorm with your team — all in real&nbsp;time, from anywhere.
        </p>

        {/* CTA row */}
        <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href={session?.user ? "/createroom" : "/signup"}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105">
            Start drawing for free
            <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="#how-it-works"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-gray-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-xs text-gray-600">
          No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; Instant setup
        </p>

        {/* ── Whiteboard Mockup ── */}
        <div className="animate-float relative mt-20 w-full max-w-5xl">
          {/* Glow behind mockup */}
          <div className="absolute inset-x-0 -top-10 mx-auto h-40 w-3/4 rounded-full bg-purple-600/30 blur-[80px]" />

          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e1e] shadow-2xl shadow-black/50">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#111124] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="mx-auto flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-4 py-1 text-xs text-gray-500">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                app.sketchsync.io/room/team-q4-planning
              </div>
            </div>

            {/* Canvas area */}
            <div className="relative h-[420px] overflow-hidden bg-[#0a0a18]">
              {/* Grid dots */}
              <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#6366f1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>

              {/* Drawn shapes */}
              <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Sticky note shapes */}
                <rect x="80" y="60" width="160" height="110" rx="8" fill="#7c3aed" fillOpacity="0.25" stroke="#7c3aed" strokeWidth="1.5" />
                <text x="160" y="108" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontFamily="sans-serif" fontWeight="600">Q4 Goals</text>
                <text x="160" y="126" textAnchor="middle" fill="#a78bfa" fontSize="9.5" fontFamily="sans-serif">Ship whiteboard v2</text>
                <text x="160" y="143" textAnchor="middle" fill="#a78bfa" fontSize="9.5" fontFamily="sans-serif">Onboard 1000 teams</text>

                <rect x="300" y="40" width="155" height="95" rx="8" fill="#0ea5e9" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="378" y="82" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontFamily="sans-serif" fontWeight="600">Tech Stack</text>
                <text x="378" y="100" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontFamily="sans-serif">Next.js · WebSockets</text>
                <text x="378" y="116" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontFamily="sans-serif">Canvas · Prisma</text>

                <rect x="510" y="55" width="150" height="100" rx="8" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="1.5" />
                <text x="585" y="98" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="sans-serif" fontWeight="600">Done ✓</text>
                <text x="585" y="116" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontFamily="sans-serif">Auth · Rooms</text>
                <text x="585" y="132" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontFamily="sans-serif">Live cursors</text>

                {/* Connectors */}
                <path className="animate-draw" d="M 240 115 C 270 115 270 88 300 88" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                <path className="animate-draw" d="M 455 88 C 480 88 485 105 510 105" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />

                {/* Freehand sketch lines */}
                <path className="animate-draw" d="M 100 230 Q 160 210 230 240 Q 300 270 370 230 Q 430 195 500 235" stroke="#818cf8" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path className="animate-draw" d="M 120 280 Q 200 260 280 275 Q 360 288 440 265" stroke="#c084fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Circle shape */}
                <circle cx="680" cy="240" r="70" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="6 3" />
                <text x="680" y="235" textAnchor="middle" fill="#f9a8d4" fontSize="11" fontFamily="sans-serif" fontWeight="600">Brainstorm</text>
                <text x="680" y="252" textAnchor="middle" fill="#f9a8d4" fontSize="9.5" fontFamily="sans-serif">ideas here</text>

                {/* Arrow */}
                <path d="M 580 240 L 608 240" stroke="#f472b6" strokeWidth="1.5" markerEnd="url(#arr)" />
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#f472b6" />
                  </marker>
                </defs>

                {/* Text note */}
                <text x="90" y="345" fill="#94a3b8" fontSize="11" fontFamily="monospace">// remember to add export feature</text>
              </svg>

              {/* Live cursors */}
              <div className="absolute" style={{ left: 340, top: 180 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#a855f7"><path d="M4 2l16 9-9 2-3 9z" /></svg>
                <span className="ml-1 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] text-white shadow">Alex</span>
              </div>
              <div className="absolute" style={{ left: 560, top: 290 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981"><path d="M4 2l16 9-9 2-3 9z" /></svg>
                <span className="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] text-white shadow">Sam</span>
              </div>

              {/* Toolbar overlay */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#111124]/90 p-2 backdrop-blur-sm shadow-xl">
                {[
                  <path key="cursor" d="M4 2l16 9-9 2-3 9z" />,
                  <><rect key="r1" x="3" y="3" width="18" height="18" rx="2" /><line key="r2" x1="3" y1="9" x2="21" y2="9" /></>,
                  <circle key="circle" cx="12" cy="12" r="9" />,
                  <path key="pen" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />,
                  <path key="text" d="M4 7V4h16v3M9 20h6M12 4v16" />,
                ].map((icon, i) => (
                  <button key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${i === 3 ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Collaborators pill */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#111124]/90 px-3 py-1.5 backdrop-blur-sm shadow-lg">
                {["#a855f7", "#10b981", "#f59e0b"].map((c, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0e0e1e]" style={{ backgroundColor: c, marginLeft: i > 0 ? -8 : 0 }} />
                ))}
                <span className="ml-1 text-xs text-gray-400">3 online</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Floating cards outside mockup */}
          <div className="animate-float-slow absolute -left-8 top-1/4 hidden rounded-xl border border-white/10 bg-[#111124]/90 p-3 shadow-2xl backdrop-blur-sm xl:block" style={{ animationDelay: "1s" }}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Participants</p>
            {[{ name: "Alex K.", color: "#a855f7" }, { name: "Sam T.", color: "#10b981" }, { name: "Mia R.", color: "#f59e0b" }].map((u) => (
              <div key={u.name} className="flex items-center gap-2 py-0.5">
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: u.color }} />
                <span className="text-xs text-gray-300">{u.name}</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>

          <div className="animate-float-slow absolute -right-8 bottom-12 hidden rounded-xl border border-white/10 bg-[#111124]/90 p-3 shadow-2xl backdrop-blur-sm xl:block" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Saved</p>
                <p className="text-[10px] text-gray-500">Auto-saved just now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ LOGOS ════════════════════════ */}
      <section className="py-16 text-center">
        <p className="text-sm text-gray-600 uppercase tracking-widest mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-10 px-8 opacity-40">
          {["Vercel", "Stripe", "Linear", "Notion", "Figma", "Loom"].map((name) => (
            <span key={name} className="text-xl font-bold tracking-tight text-gray-300">{name}</span>
          ))}
        </div>
      </section>

      {/* ════════════════════════ FEATURES ════════════════════════ */}
      <section id="features" className="px-6 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">Features</p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Everything your team needs</h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              A complete toolkit for visual collaboration — no plugins, no friction, just a canvas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" />
                ),
                color: "from-purple-600/20 to-purple-600/5",
                border: "border-purple-500/20",
                accent: "text-purple-400",
                title: "Real-time Multiplayer",
                desc: "See every stroke, move, and annotation live. Collaborate with your entire team simultaneously.",
              },
              {
                icon: (
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                ),
                color: "from-sky-600/20 to-sky-600/5",
                border: "border-sky-500/20",
                accent: "text-sky-400",
                title: "Rich Drawing Tools",
                desc: "Pen, shapes, arrows, sticky notes, text — everything you'd expect from a professional whiteboard.",
              },
              {
                icon: (
                  <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>
                ),
                color: "from-indigo-600/20 to-indigo-600/5",
                border: "border-indigo-500/20",
                accent: "text-indigo-400",
                title: "Infinite Canvas",
                desc: "Pan and zoom endlessly. Your ideas are never boxed in — the canvas grows with your thinking.",
              },
              {
                icon: (
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7zM13 2v7h7" />
                ),
                color: "from-emerald-600/20 to-emerald-600/5",
                border: "border-emerald-500/20",
                accent: "text-emerald-400",
                title: "Auto-Save & History",
                desc: "Every change is saved automatically. Jump back in time with full version history.",
              },
              {
                icon: (
                  <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>
                ),
                color: "from-pink-600/20 to-pink-600/5",
                border: "border-pink-500/20",
                accent: "text-pink-400",
                title: "Live Chat & Comments",
                desc: "Leave notes, pin comments to objects, or chat in realtime without switching context.",
              },
              {
                icon: (
                  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>
                ),
                color: "from-amber-600/20 to-amber-600/5",
                border: "border-amber-500/20",
                accent: "text-amber-400",
                title: "Private Rooms",
                desc: "Create named rooms for each project. Invite-only with JWT-secured access control.",
              },
            ].map((f) => (
              <div key={f.title}
                className={`group rounded-2xl border ${f.border} bg-gradient-to-b ${f.color} p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${f.border} bg-white/5`}>
                  <svg className={f.accent} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section id="how-it-works" className="relative px-6 py-24 md:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Up and running in seconds</h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-sky-500/40 md:block" />

            {[
              { num: "01", color: "from-purple-500 to-indigo-500", title: "Create an account", desc: "Sign up in seconds. No credit card required. Jump straight into the canvas." },
              { num: "02", color: "from-indigo-500 to-sky-500", title: "Open a room", desc: "Create a named room for your project. Share the link with anyone on your team." },
              { num: "03", color: "from-sky-500 to-emerald-500", title: "Start collaborating", desc: "Draw, plan, and think together — see each other's cursors and changes live." },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className={`mb-5 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <span className="text-2xl font-black text-white">{step.num}</span>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl opacity-40`} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ STATS ════════════════════════ */}
      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "10k+", label: "Active teams" },
            { value: "<50ms", label: "Sync latency" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "∞", label: "Canvas size" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black tracking-tight animate-shimmer">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════ CTA BANNER ════════════════════════ */}
      <section className="px-6 py-24 md:px-16">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-sky-900/20 p-12 text-center shadow-2xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/30 blur-[80px]" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-sky-600/20 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Get started today</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Your next big idea starts<br />with a blank canvas
            </h2>
            <p className="mt-5 text-lg text-gray-400 max-w-xl mx-auto">
              Join thousands of teams already using SketchSync to turn ideas into reality.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/50">
                Start for free — no card needed
                <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer className="border-t border-white/5 px-8 py-10 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">SketchSync</span>
          </div>

          <div className="flex items-center gap-6 text-gray-500 text-xs">
            {["Privacy", "Terms", "Status", "GitHub"].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-gray-300">{l}</a>
            ))}
          </div>

          <p className="text-xs text-gray-600">© 2026 SketchSync. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

