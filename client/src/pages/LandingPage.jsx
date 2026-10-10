import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EduvaLogo from "../components/EduvaLogo";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4fbf6] text-[#253D2C] selection:bg-[#CFFFDC] selection:text-[#253D2C]">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#c9ebd6]/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <EduvaLogo className="w-9 h-9 shadow-xs transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#253D2C] leading-none">
                Eduva
              </span>
              <span className="text-[10px] text-[#477e57] font-bold tracking-wider uppercase mt-0.5">
                Focus & Streaks
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#376344]">
            <a href="#features" className="hover:text-[#2E6F40] transition">Features</a>
            <a href="#pillars" className="hover:text-[#2E6F40] transition">Pillars</a>
            <a href="#methodology" className="hover:text-[#2E6F40] transition">Methodology</a>
            <a href="#testimonials" className="hover:text-[#2E6F40] transition">Success Stories</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-[#2E6F40] hover:text-[#253D2C] px-3.5 py-2 rounded-xl hover:bg-[#e3f5eb] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs shadow-[#2E6F40]/20"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
          {/* Left Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CFFFDC] border border-[#68BA7F]/40 text-[#2E6F40] text-xs font-black tracking-wide uppercase shadow-2xs">
              <span>⚡</span>
              <span>Scientifically-Backed Focus Tracking</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#253D2C] tracking-tight leading-[1.12]">
              Forge Unstoppable <br className="hidden sm:inline" />
              <span className="text-[#2E6F40] underline decoration-[#CFFFDC] decoration-wavy decoration-2">
                Academic Habits
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-[#477e57] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Eduva combines structured subject management, custom Pomodoro timers,
              and gamified streak calendars to elevate your focus and guarantee peak performance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full sm:w-auto text-center bg-[#2E6F40] hover:bg-[#253D2C] text-white px-7 py-3.5 rounded-xl text-sm font-bold transition shadow-md shadow-[#2E6F40]/25 hover:shadow-lg"
              >
                {user ? "Open Your Dashboard →" : "Create Your Study Forge"}
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto text-center bg-white hover:bg-[#e3f5eb] text-[#253D2C] border border-[#c9ebd6] px-6 py-3.5 rounded-xl text-sm font-bold transition shadow-xs"
              >
                Explore Live Demo
              </a>
            </div>

            {/* Micro stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-[#477e57] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="text-[#2E6F40]">✓</span> 100% Free for Students
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#2E6F40]">✓</span> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#2E6F40]">✓</span> Real-Time Analytics
              </span>
            </div>
          </div>

          {/* Right Hero Graphic Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative bg-[#253D2C] rounded-3xl p-5 shadow-2xl border-4 border-[#2E6F40]/40 text-white">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2E6F40]/60 text-xs">
                <div className="flex items-center gap-2">
                  <EduvaLogo className="w-6 h-6" />
                  <span className="font-bold text-[#CFFFDC]">Eduva Study Forge</span>
                </div>
                <span className="bg-[#2E6F40] text-[#CFFFDC] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  🔥 12-Day Streak
                </span>
              </div>

              {/* Mockup Metrics Cards */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="bg-[#1b2e21] p-3 rounded-xl border border-[#2E6F40]/60">
                  <p className="text-[10px] text-[#68BA7F] font-bold uppercase">Today Focused</p>
                  <p className="text-lg font-black text-[#CFFFDC] mt-0.5">2h 45m</p>
                </div>
                <div className="bg-[#1b2e21] p-3 rounded-xl border border-[#2E6F40]/60">
                  <p className="text-[10px] text-[#68BA7F] font-bold uppercase">Streak Record</p>
                  <p className="text-lg font-black text-amber-400 mt-0.5">18 Days</p>
                </div>
                <div className="bg-[#1b2e21] p-3 rounded-xl border border-[#2E6F40]/60">
                  <p className="text-[10px] text-[#68BA7F] font-bold uppercase">Badges</p>
                  <p className="text-lg font-black text-[#68BA7F] mt-0.5">7 Earned</p>
                </div>
              </div>

              {/* Mockup Heatmap Grid */}
              <div className="bg-[#1b2e21] p-3.5 rounded-xl border border-[#2E6F40]/60 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-[#CFFFDC]/90 font-bold">
                  <span>Habit Consistency Heatmap</span>
                  <span className="text-[10px] text-[#68BA7F]">Sept - Oct 2026</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[3, 0, 2, 4, 3, 1, 4, 2, 3, 0, 4, 3, 2, 4, 3, 1, 2, 4, 3, 4, 0, 3, 4, 2, 3].map((val, idx) => {
                    const colors = [
                      "bg-[#253D2C] border border-[#2E6F40]/30",
                      "bg-[#2E6F40]/60",
                      "bg-[#2E6F40]",
                      "bg-[#68BA7F]",
                      "bg-[#CFFFDC]",
                    ];
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-sm ${colors[val]}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Mockup Task Plan */}
              <div className="mt-3.5 space-y-2">
                <p className="text-[11px] text-[#68BA7F] font-bold uppercase">Queued Targets</p>
                <div className="bg-[#1b2e21] p-2.5 rounded-xl border border-[#2E6F40]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="font-semibold text-[#CFFFDC]">Organic Chemistry II - Reactions</span>
                  </div>
                  <span className="text-[11px] text-[#68BA7F]">45m</span>
                </div>
                <div className="bg-[#1b2e21] p-2.5 rounded-xl border border-[#2E6F40]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">○</span>
                    <span className="font-semibold text-white">Calculus III - Triple Integrals</span>
                  </div>
                  <span className="text-[11px] text-[#68BA7F]">60m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Global Institutions ────────────── */}
      <section className="border-y border-[#c9ebd6] bg-white/70 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold tracking-widest text-[#477e57] uppercase">
            Adopted by Top Students from Global Institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm sm:text-base font-black text-[#376344]/80">
            <span>Stanford University</span>
            <span>MIT</span>
            <span>University of Oxford</span>
            <span>Harvard University</span>
            <span>Cambridge</span>
          </div>
        </div>
      </section>

      {/* ── 4 Clear Pillars ───────────────────────────────── */}
      <section id="pillars" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-[#253D2C] tracking-tight">
            Forge Your Success in 4 Clear Pillars
          </h2>
          <p className="text-sm sm:text-base text-[#477e57] font-medium leading-relaxed">
            Our structure is built around proven cognitive science to keep you aligned, energized, and deeply focused.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              num: "1. List Subjects",
              icon: "📖",
              desc: "Organize your semester into tracked modules. Monitor distinct study hours per course.",
            },
            {
              num: "2. Deep Focus",
              icon: "⏱️",
              desc: "Run state-of-the-art customizable timers built to eliminate split-attention fatigue.",
            },
            {
              num: "3. Keep Streaks",
              icon: "📅",
              desc: "Never break your momentum. Visually inspect study intensity with GitHub-style heatmaps.",
            },
            {
              num: "4. Earn Badges",
              icon: "🎖️",
              desc: "Unlock beautiful academic achievements that celebrate key 30-day study milestones.",
            },
          ].map((pillar) => (
            <div
              key={pillar.num}
              className="bg-white rounded-2xl p-6 border border-[#c9ebd6] shadow-xs hover:border-[#68BA7F] hover:shadow-md transition space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CFFFDC] border border-[#68BA7F]/40 flex items-center justify-center text-2xl">
                {pillar.icon}
              </div>
              <h3 className="font-bold text-base text-[#253D2C]">{pillar.num}</h3>
              <p className="text-xs text-[#477e57] leading-relaxed font-medium">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Deep Dive 1: Subject Management ───────── */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto border-t border-[#c9ebd6]">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Visual Showcase Card */}
          <div className="flex-1 w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#c9ebd6] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
              <span className="font-black text-sm text-[#253D2C] uppercase tracking-wider">
                Module Tracking & Progress
              </span>
              <span className="text-xs bg-[#CFFFDC] text-[#2E6F40] px-2.5 py-1 rounded-full font-bold">
                Live Stats
              </span>
            </div>

            {/* Mock subjects cards */}
            {[
              { name: "Organic Chemistry II", code: "CHEM 302", hours: "18.5 hrs / 25 hrs", pct: 74, color: "#2E6F40" },
              { name: "Calculus III", code: "MATH 301", hours: "12.0 hrs / 20 hrs", pct: 60, color: "#68BA7F" },
              { name: "Systems Programming", code: "CS 341", hours: "24.5 hrs / 30 hrs", pct: 81, color: "#253D2C" },
            ].map((sub) => (
              <div key={sub.code} className="bg-[#f8fdfa] rounded-xl p-4 border border-[#c9ebd6] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#253D2C]">
                  <div>
                    <span className="block font-black text-sm">{sub.name}</span>
                    <span className="text-[11px] text-[#68BA7F]">{sub.code}</span>
                  </div>
                  <span className="text-[#2E6F40] font-mono">{sub.hours}</span>
                </div>
                <div className="h-2 w-full bg-[#e3f5eb] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${sub.pct}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Text Description */}
          <div className="flex-1 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#2E6F40] bg-[#CFFFDC] px-3 py-1 rounded-md">
              Smart Subject Management
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#253D2C] leading-tight">
              Know Exactly Where Your Time Goes
            </h2>
            <p className="text-sm sm:text-base text-[#477e57] leading-relaxed font-medium">
              Stop guessing which modules are lagging. Create target trackers for complex sciences, literature, or languages.
              Measure cumulative efforts down to the second with integrated real-time analytics.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2E6F40] hover:text-[#253D2C] bg-[#e3f5eb] hover:bg-[#CFFFDC] px-4 py-2.5 rounded-xl transition"
              >
                <span>Track Your Subjects Now</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Deep Dive 2: Streaks & Badges ─────────── */}
      <section id="methodology" className="py-16 px-6 max-w-6xl mx-auto border-t border-[#c9ebd6]">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Text Description */}
          <div className="flex-1 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#2E6F40] bg-[#CFFFDC] px-3 py-1 rounded-md">
              Scholarly Habit Gameplay
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#253D2C] leading-tight">
              Fuel Your Progress with Streaks
            </h2>
            <p className="text-sm sm:text-base text-[#477e57] leading-relaxed font-medium">
              Our GitHub-style engagement heatmap renders daily study density over months, showing you exactly when you hit peak performance.
              Earn exclusive academic honor badges for streaks, early mornings, and late-night research.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#2E6F40] hover:text-[#253D2C] bg-[#e3f5eb] hover:bg-[#CFFFDC] px-4 py-2.5 rounded-xl transition"
              >
                <span>Inspect Milestone Badges</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Trophy & Badges Mockup */}
          <div className="flex-1 w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#c9ebd6] shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
              <span className="font-black text-sm text-[#253D2C] uppercase tracking-wider">
                Milestone Trophy Showcase
              </span>
              <span className="text-xs text-[#2E6F40] font-bold">Every 30 Days</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "First Forge", icon: "🌱", tier: "Bronze", unlocked: true, desc: "Completed your first study goal" },
                { name: "7-Day Streak", icon: "🔥", tier: "Silver", unlocked: true, desc: "Maintained 7 consecutive active days" },
                { name: "30-Day Scholar", icon: "🏆", tier: "Gold", unlocked: true, desc: "Mastered 30 days of consistent habits" },
                { name: "Centurion (100h)", icon: "⚡", tier: "Platinum", unlocked: false, desc: "Logged 100 cumulative hours" },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className={`p-3.5 rounded-xl border transition ${
                    badge.unlocked
                      ? "bg-[#f8fdfa] border-[#68BA7F]/40 shadow-xs"
                      : "bg-[#fcfefd] border-dashed border-[#c9ebd6] opacity-70"
                  }`}
                >
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <p className="font-bold text-xs text-[#253D2C]">{badge.name}</p>
                  <p className="text-[10px] text-[#477e57] mt-0.5">{badge.desc}</p>
                  <span className="inline-block mt-2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-[#CFFFDC] text-[#2E6F40]">
                    {badge.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-6 max-w-6xl mx-auto border-t border-[#c9ebd6]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-[#253D2C] tracking-tight">
            What Serious Students Achieve
          </h2>
          <p className="text-sm sm:text-base text-[#477e57] font-medium leading-relaxed">
            Real feedback from high-achieving students tracking their daily study hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "Eduva revolutionized my MCAT prep. Breaking down Biochemistry vs. Physics hours showed me exactly where to redirect my focus.",
              author: "Olivia Vance",
              role: "Pre-Med, Johns Hopkins",
              avatar: "OV",
            },
            {
              quote:
                "The streak heatmap is addictive. I haven't broken my focus chain in 45 days. My CS grades have never been higher.",
              author: "Hussein Al-Fayed",
              role: "Computer Science, Stanford",
              avatar: "HA",
            },
            {
              quote:
                "Minimal distractions, flawless UI, and no gamified filler. Just pure, scientific progress tracking.",
              author: "Evelyn Sterling",
              role: "Pure Mathematics, Cambridge",
              avatar: "ES",
            },
          ].map((t) => (
            <div
              key={t.author}
              className="bg-white rounded-2xl p-6 border border-[#c9ebd6] shadow-xs flex flex-col justify-between space-y-4"
            >
              <p className="text-xs sm:text-sm text-[#376344] leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[#e3f5eb]">
                <div className="w-9 h-9 rounded-full bg-[#2E6F40] text-[#CFFFDC] flex items-center justify-center font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-xs text-[#253D2C]">{t.author}</p>
                  <p className="text-[10px] text-[#68BA7F] font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ready to Forge Peak Focus? (Dark CTA Banner) ──── */}
      <section className="py-20 px-6 bg-[#253D2C] text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <EduvaLogo className="w-12 h-12 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-black text-[#CFFFDC] tracking-tight">
            Ready to Forge Peak Focus?
          </h2>
          <p className="text-sm sm:text-base text-[#bbf7cf]/80 max-w-xl mx-auto leading-relaxed">
            Join over 12,000 top-performing students managing workloads, keeping streaks, and claiming masteries.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/register";
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="Enter your student email…"
              className="w-full sm:w-72 bg-white text-[#253D2C] placeholder:text-[#68BA7F] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#CFFFDC]"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#2E6F40] hover:bg-[#68BA7F] text-white px-5 py-3 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-md"
            >
              Get Started Free
            </button>
          </form>

          <p className="text-[11px] text-[#68BA7F] pt-2">
            No installation required · Works in any modern web browser
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#c9ebd6] bg-white py-8 px-6 text-xs text-[#477e57]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EduvaLogo className="w-5 h-5" />
            <span className="font-black text-[#253D2C]">Eduva</span>
            <span>· Academic Habit Forge</span>
          </div>
          <p>© {new Date().getFullYear()} Eduva. Built for focused scholars.</p>
        </div>
      </footer>
    </div>
  );
}
