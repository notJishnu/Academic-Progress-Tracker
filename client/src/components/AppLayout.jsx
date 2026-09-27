import { useState } from "react";
import Sidebar from "./Sidebar";
import ProfilePanel from "./panels/ProfilePanel";
import AppearancePanel from "./panels/AppearancePanel";
import SettingsPanel from "./panels/SettingsPanel";
import BadgeShelf from "./BadgeShelf";

/**
 * AppLayout wraps the authenticated app with a persistent left sidebar.
 * `children` = the Dashboard tracker content (passed as the "dashboard" panel).
 *
 * Props forwarded from the parent so panels can read live data:
 *   badges, dailySummary, timerRunning, timerGoalTitle
 */
export default function AppLayout({
  children,
  badges = [],
  dailySummary = null,
  timerRunning = false,
  timerGoalTitle = "",
}) {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const renderPanel = () => {
    switch (activePage) {
      case "profile":
        return <ProfilePanel badges={badges} dailySummary={dailySummary} />;
      case "badges":
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="pt-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Badges</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Milestones you've unlocked along your study journey
              </p>
            </div>
            <BadgeShelf badges={badges} />
          </div>
        );
      case "appearance":
        return <AppearancePanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return children; // dashboard
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* ── Sidebar ─────────────────────────── */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        timerRunning={timerRunning}
        timerGoalTitle={timerGoalTitle}
      />

      {/* ── Main content area ────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        {renderPanel()}
      </div>
    </div>
  );
}
