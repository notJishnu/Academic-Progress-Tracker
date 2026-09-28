import Sidebar from "./Sidebar";

/**
 * AppLayout wraps the authenticated app with the persistent left sidebar.
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
  return (
    <div className="flex min-h-screen bg-[#f4fbf6] text-[#253D2C]">
      {/* ── Persistent Sidebar (Left) ───────────────────── */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        timerRunning={timerRunning}
        timerGoalTitle={timerGoalTitle}
      />

      {/* ── Main View Content Area ──────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
