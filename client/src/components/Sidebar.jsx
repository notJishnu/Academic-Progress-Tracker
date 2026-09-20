import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📊", label: "Dashboard" },
  { key: "profile",   icon: "👤", label: "Profile" },
  { key: "badges",    icon: "🏆", label: "Badges" },
  { key: "appearance",icon: "🎨", label: "Appearance" },
  { key: "settings",  icon: "⚙️", label: "Settings" },
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
  const { theme, toggleTheme } = useTheme();

  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 h-screen sticky top-0 transition-all duration-300 z-30 ${
          collapsed ? "w-[68px]" : "w-[210px]"
        }`}
      >
        {/* Top: logo + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100 dark:border-slate-800">
          {!collapsed && (
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              📈 APT
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-auto"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Active timer indicator */}
        {timerRunning && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl">
            <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse inline-block" />
              Timer Active
            </p>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400/80 truncate mt-0.5">
              {timerGoalTitle}
            </p>
          </div>
        )}
        {timerRunning && collapsed && (
          <div className="mx-2 mt-3 flex justify-center">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={collapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
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

        {/* Bottom: theme toggle + streak + logout */}
        <div className="px-2 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {/* Dark / light toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle dark mode"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            <span className="text-base flex-shrink-0">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
            {!collapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>

          {/* Streak chip */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-orange-500 text-sm">🔥</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {user?.currentStreak ?? 0} day streak
              </span>
            </div>
          )}

          {/* User avatar + logout */}
          <button
            onClick={logout}
            title="Logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initial}
            </span>
            {!collapsed && (
              <span className="truncate text-xs">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-40 flex items-center justify-around px-2 py-1.5 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 transition"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </>
  );
}
