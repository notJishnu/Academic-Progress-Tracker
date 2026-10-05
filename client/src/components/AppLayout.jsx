import { useAuth } from "../context/AuthContext";
import EduvaLogo from "./EduvaLogo";
import Sidebar from "./Sidebar";
import { Flame } from "lucide-react";

/**
 * AppLayout wraps the authenticated app with the persistent top header and bottom macOS dock.
 */
export default function AppLayout({
  activePage = "dashboard",
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  timerRunning = false,
  timerGoalTitle = "",
  children,
}) {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#f4fbf6] text-[#253D2C] flex flex-col">
      {/* ── Top Header Navigation Bar ───────────────────── */}
      <header className="sticky top-0 z-30 bg-[#f4fbf6]/90 backdrop-blur-md border-b border-[#c9ebd6]/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EduvaLogo className="w-8 h-8 flex-shrink-0" />
          <div>
            <span className="text-base font-black tracking-tight text-[#253D2C] leading-none block">
              Eduva
            </span>
            <span className="text-[11px] text-[#2E6F40] font-semibold leading-none">
              Academic Progress Tracker
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Active Indicator */}
          {timerRunning && (
            <button
              onClick={() => onNavigate("timer")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2E6F40]/10 hover:bg-[#2E6F40]/20 border border-[#2E6F40]/30 rounded-full text-xs font-semibold text-[#2E6F40] transition"
              title="Click to view running timer"
            >
              <span className="w-2 h-2 rounded-full bg-[#2E6F40] animate-pulse" />
              <span className="truncate max-w-[200px]">Focus: {timerGoalTitle || "Active"}</span>
            </button>
          )}

          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-[#253D2C]">
            <Flame className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.2} />
            <span>{user?.currentStreak ?? 0}d streak</span>
          </div>

          {/* User Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-[#2E6F40] text-[#CFFFDC] flex items-center justify-center text-xs font-black shadow-xs"
            title={user?.name || "User profile"}
          >
            {initial}
          </div>
        </div>
      </header>

      {/* ── Main View Content Area ──────────────────────── */}
      {/* pb-36 / pb-40 gives generous bottom clearance so inputs and placeholder texts are never blocked */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6 pb-36 sm:pb-40">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* ── Bottom macOS Floating Dock Navigation ───────── */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        timerRunning={timerRunning}
        timerGoalTitle={timerGoalTitle}
      />
    </div>
  );
}
