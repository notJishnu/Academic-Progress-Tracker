import { useState } from "react";
import Sidebar from "./Sidebar";
import ProfilePanel from "./panels/ProfilePanel";
import SettingsPanel from "./panels/SettingsPanel";
import BadgeShelf from "./BadgeShelf";

/**
 * AppLayout wraps the authenticated app with a persistent left sidebar.
 * `children` = the Dashboard tracker content (passed as the "dashboard" panel).
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
          <div className="p-6 max-w-5xl mx-auto space-y-4">
            <div className="pt-2 mb-2">
              <h2 className="text-2xl font-black text-[#253D2C]">Badges & Milestones</h2>
              <p className="text-sm text-[#477e57] mt-0.5">
                Prestige achievements earned through continuous study streaks
              </p>
            </div>
            <BadgeShelf badges={badges} />
          </div>
        );
      case "settings":
        return <SettingsPanel />;
      default:
        return children; // dashboard
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3fbf6] text-[#253D2C]">
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
      <div className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-6">
        {renderPanel()}
      </div>
    </div>
  );
}
