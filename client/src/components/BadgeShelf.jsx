import { useState } from "react";

const TIER_STYLES = {
  bronze: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    glow: "shadow-amber-100",
    bar: "bg-amber-500",
  },
  silver: {
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    glow: "shadow-slate-200",
    bar: "bg-slate-500",
  },
  gold: {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    glow: "shadow-yellow-100",
    bar: "bg-yellow-500",
  },
  platinum: {
    badge: "bg-cyan-100 text-cyan-800 border-cyan-300",
    glow: "shadow-cyan-100",
    bar: "bg-cyan-500",
  },
  diamond: {
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    glow: "shadow-purple-100",
    bar: "bg-purple-500",
  },
};

export default function BadgeShelf({ badges = [] }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'unlocked' | 'streak'

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.unlocked;
    if (filter === "streak") return b.type === "streak";
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            🏆 Milestones & 30-Day Badges
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Earn prestige badges every 30 days of consistent study streaks and volume milestones.
          </p>
        </div>

        <div className="flex gap-1.5 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === "unlocked"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter("streak")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === "streak"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            30-Day Streaks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBadges.map((badge) => {
          const style = TIER_STYLES[badge.tier] || TIER_STYLES.bronze;

          return (
            <div
              key={badge.id}
              className={`relative border rounded-xl p-3.5 flex flex-col justify-between transition ${
                badge.unlocked
                  ? "bg-gradient-to-br from-white to-slate-50/80 border-slate-200 shadow-sm"
                  : "bg-slate-50/50 border-dashed border-slate-200 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-2xl p-2 rounded-xl border ${style.badge} flex items-center justify-center`}
                    >
                      {badge.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                        {badge.name}
                        {badge.unlocked && (
                          <span className="text-emerald-600 text-xs">✓</span>
                        )}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {badge.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                    <span>Unlocked 🎉</span>
                    {badge.unlockedAt && (
                      <span className="text-slate-400 font-normal">
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium text-slate-700">
                        {badge.progress} / {badge.target}{" "}
                        {badge.type === "streak"
                          ? "days"
                          : badge.type === "minutes"
                          ? "mins"
                          : "goals"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${style.bar} rounded-full transition-all duration-300`}
                        style={{ width: `${badge.pct || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
