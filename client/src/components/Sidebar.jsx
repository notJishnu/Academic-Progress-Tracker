import { useAuth } from "../context/AuthContext";
import EduvaLogo from "./EduvaLogo";

const NAV_ITEMS = [
  { key: "dashboard",  icon: "🎛️", label: "Dashboard" },
  { key: "subjects",   icon: "📖", label: "My Subjects" },
  { key: "timer",      icon: "⏱️", label: "Focus Timer" },
  { key: "milestones", icon: "🏆", label: "Milestones" },
  { key: "settings",   icon: "⚙️", label: "Settings" },
];

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  timerRunning = false,
  timerGoalTitle = "",
}) {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-[#253D2C] text-[#CFFFDC] border-r border-[#2E6F40]/60 h-screen sticky top-0 transition-all duration-300 z-30 ${
          collapsed ? "w-[68px]" : "w-[210px]"
        }`}
      >
        {/* Top: logo + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b border-[#2E6F40]/60">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 truncate">
              <EduvaLogo className="w-8 h-8" />
              <div className="truncate">
                <span className="text-base font-black tracking-wide text-[#CFFFDC] block leading-tight">
                  Eduva
                </span>
                <span className="text-[10px] text-[#68BA7F] font-semibold block leading-none">
                  Progress Tracker
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto" title="Eduva">
              <EduvaLogo className="w-7 h-7" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-[#68BA7F] hover:text-white hover:bg-[#2E6F40]/60 transition ${
              collapsed ? "hidden" : "ml-auto"
            }`}
            title="Collapse sidebar"
          >
            ◀
          </button>
        </div>

        {collapsed && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-[#68BA7F] hover:text-white hover:bg-[#2E6F40]/60 transition text-xs"
              title="Expand sidebar"
            >
              ▶
            </button>
          </div>
        )}

        {/* Active timer indicator */}
        {timerRunning && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 bg-[#2E6F40]/60 border border-[#68BA7F]/40 rounded-xl">
            <p className="text-[11px] font-bold text-[#CFFFDC] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#68BA7F] rounded-full animate-pulse inline-block" />
              Timer Active
            </p>
            <p className="text-[10px] text-[#CFFFDC]/80 truncate mt-0.5">
              {timerGoalTitle}
            </p>
          </div>
        )}
        {timerRunning && collapsed && (
          <div className="mx-2 mt-3 flex justify-center">
            <span className="w-3 h-3 bg-[#68BA7F] rounded-full animate-pulse" />
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={collapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-[#2E6F40] text-white shadow-sm font-semibold border border-[#68BA7F]/40"
                    : "text-[#CFFFDC]/85 hover:bg-[#2E6F40]/40 hover:text-white"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: streak + user avatar + logout */}
        <div className="px-2 py-3 border-t border-[#2E6F40]/60 space-y-2">
          {/* Streak chip */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#2E6F40]/40 rounded-xl border border-[#68BA7F]/30">
              <span className="text-orange-400 text-sm">🔥</span>
              <span className="text-xs font-semibold text-[#CFFFDC]">
                {user?.currentStreak ?? 0} day streak
              </span>
            </div>
          )}

          {/* User info & logout */}
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-[#68BA7F] text-[#253D2C] flex items-center justify-center text-xs font-black flex-shrink-0">
                {initial}
              </span>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-[#CFFFDC] truncate leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-[#68BA7F] truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#CFFFDC]/70 hover:text-red-300 hover:bg-red-900/30 transition text-xs font-semibold"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#253D2C] border-t border-[#2E6F40] z-40 flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
                active
                  ? "text-[#CFFFDC] font-bold bg-[#2E6F40]/60"
                  : "text-[#68BA7F] hover:text-[#CFFFDC]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px]">
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[#68BA7F] hover:text-red-300 transition"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>
    </>
  );
}
