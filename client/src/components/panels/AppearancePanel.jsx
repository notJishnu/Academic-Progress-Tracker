import { useTheme } from "../../context/ThemeContext";

const THEMES = [
  {
    key: "light",
    icon: "☀️",
    label: "Light",
    description: "Clean white background",
    previewBg: "bg-white border border-slate-200",
    previewText: "text-slate-800",
  },
  {
    key: "dark",
    icon: "🌙",
    label: "Dark",
    description: "Easy on the eyes at night",
    previewBg: "bg-slate-900 border border-slate-700",
    previewText: "text-slate-100",
  },
  {
    key: "system",
    icon: "💻",
    label: "System",
    description: "Follows your OS setting",
    previewBg: "bg-gradient-to-br from-white to-slate-900 border border-slate-300",
    previewText: "text-slate-500",
  },
];

export default function AppearancePanel() {
  const { theme, setSpecificTheme } = useTheme();

  const handleSelect = (key) => {
    if (key === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSpecificTheme(prefersDark ? "dark" : "light");
    } else {
      setSpecificTheme(key);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Appearance
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose how the app looks to you
        </p>
      </div>

      {/* Theme selector */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Color Theme
        </h3>
        <div className="space-y-3">
          {THEMES.map((t) => {
            const active = theme === t.key || (t.key === "system" && false);
            return (
              <button
                key={t.key}
                onClick={() => handleSelect(t.key)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition text-left ${
                  active
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm shadow-indigo-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {/* Mini preview swatch */}
                <div
                  className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${t.previewBg}`}
                >
                  {t.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.description}
                  </p>
                </div>

                {/* Active indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                    active
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {active && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick toggle shortcut hint */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 You can also toggle dark / light mode from the <span className="font-semibold text-slate-700 dark:text-slate-300">sidebar</span> at any time using the 🌙 icon.
        </p>
      </div>
    </div>
  );
}
