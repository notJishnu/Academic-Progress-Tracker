import { useState } from "react";

const TIER_STYLES = {
  bronze: {
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    bar: "bg-amber-500",
  },
  silver: {
    badge: "bg-slate-100 text-slate-800 border-slate-300",
    bar: "bg-slate-500",
  },
  gold: {
    badge: "bg-yellow-100 text-yellow-900 border-yellow-300",
    bar: "bg-yellow-500",
  },
  platinum: {
    badge: "bg-cyan-100 text-cyan-900 border-cyan-300",
    bar: "bg-cyan-500",
  },
  diamond: {
    badge: "bg-purple-100 text-purple-900 border-purple-300",
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
    <div className="bg-white rounded-xl shadow-xs border border-[#c9ebd6] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-lg text-[#253D2C] flex items-center gap-2">
            🏆 Milestones & 30-Day Badges
            <span className="text-xs bg-[#CFFFDC] text-[#2E6F40] font-bold px-2.5 py-0.5 rounded-full border border-[#68BA7F]/40">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </h2>
          <p className="text-xs text-[#477e57] mt-0.5">
            Earn prestige badges every 30 days of consistent study streaks and volume milestones.
          </p>
        </div>

        <div className="flex gap-1.5 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "all"
                ? "bg-[#2E6F40] text-white shadow-xs"
                : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "unlocked"
                ? "bg-[#2E6F40] text-white shadow-xs"
                : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter("streak")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "streak"
                ? "bg-[#2E6F40] text-white shadow-xs"
                : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
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
                  ? "bg-[#f8fdfa] border-[#68BA7F]/40 shadow-xs"
                  : "bg-[#fcfefd] border-dashed border-[#c9ebd6] opacity-75"
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
                      <h3 className="font-bold text-sm text-[#253D2C] flex items-center gap-1.5">
                        {badge.name}
                        {badge.unlocked && (
                          <span className="text-[#2E6F40] text-xs">✓</span>
                        )}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#68BA7F]">
                        {badge.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#376344] mt-2.5 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#e3f5eb]">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-[#2E6F40] font-bold">
                    <span>Unlocked 🎉</span>
                    {badge.unlockedAt && (
                      <span className="text-[#68BA7F] font-normal">
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[11px] text-[#477e57] mb-1 font-medium">
                      <span>Progress</span>
                      <span className="font-bold text-[#253D2C]">
                        {badge.progress} / {badge.target}{" "}
                        {badge.type === "streak"
                          ? "days"
                          : badge.type === "minutes"
                          ? "mins"
                          : "goals"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#e3f5eb] rounded-full overflow-hidden">
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
