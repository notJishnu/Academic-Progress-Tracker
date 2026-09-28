export default function MilestonesView({ user, badges = [], dailySummary = null }) {
  const dailyLogs = dailySummary?.dailyLogs || {};
  const completedDatesSet = new Set(user?.completedDates || []);

  // Generate 70 days (10 weeks) for full habit heatmap
  const days = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const minutes = dailyLogs[key] || 0;
    const active = completedDatesSet.has(key);
    days.push({ date: d, key, minutes, active });
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="pb-2 border-b border-[#c9ebd6]">
        <h1 className="text-2xl font-black text-[#253D2C] leading-tight">
          Achievements & Streaks
        </h1>
        <p className="text-xs text-[#477e57] font-medium mt-0.5">
          Visualize consistency with daily tracking heatmaps and inspect your academic badge milestones.
        </p>
      </div>

      {/* ── Daily Habit Heatmap Card (Screenshot 3) ─────────── */}
      <div className="bg-white rounded-3xl border border-[#c9ebd6] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e3f5eb]">
          <div>
            <h2 className="text-base font-black text-[#253D2C]">Daily Habit Heatmap</h2>
            <p className="text-xs text-[#477e57]">
              Grid mapping focus intensities across sessions. Colors correspond to duration total.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#CFFFDC] text-[#2E6F40] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#68BA7F]/40 shrink-0">
            <span>🔥</span>
            <span>Current Streak: {user?.currentStreak ?? 0} Days</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto py-2">
          <div className="min-w-[600px] flex gap-2">
            {/* Day labels column */}
            <div className="flex flex-col justify-between text-[10px] text-[#68BA7F] font-bold py-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Day tiles */}
            <div className="flex-1 flex gap-1.5 flex-wrap">
              {days.map((d) => {
                let colorClass = "bg-[#e3f5eb] hover:bg-[#c9ebd6]";
                if (d.minutes >= 120) colorClass = "bg-[#253D2C]";
                else if (d.minutes >= 60) colorClass = "bg-[#2E6F40]";
                else if (d.minutes >= 30) colorClass = "bg-[#68BA7F]";
                else if (d.minutes > 0 || d.active) colorClass = "bg-[#CFFFDC] border border-[#68BA7F]/40";

                const isToday = d.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={d.key}
                    title={`${d.key}: ${d.minutes} mins studied`}
                    className={`w-6 h-6 rounded-md transition cursor-pointer ${colorClass} ${
                      isToday ? "ring-2 ring-[#2E6F40] ring-offset-1" : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-[#477e57] pt-3 border-t border-[#e3f5eb]">
          <span>Longest streak on record: <b className="text-[#253D2C]">{user?.longestStreak ?? 0} Days</b></span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Less</span>
            <span className="w-3.5 h-3.5 rounded-sm bg-[#e3f5eb] inline-block" />
            <span className="w-3.5 h-3.5 rounded-sm bg-[#CFFFDC] inline-block" />
            <span className="w-3.5 h-3.5 rounded-sm bg-[#68BA7F] inline-block" />
            <span className="w-3.5 h-3.5 rounded-sm bg-[#2E6F40] inline-block" />
            <span className="w-3.5 h-3.5 rounded-sm bg-[#253D2C] inline-block" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* ── Achievements Gallery (Screenshot 3) ─────────────── */}
      <div className="bg-white rounded-3xl border border-[#c9ebd6] shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
          <div>
            <h2 className="text-base font-black text-[#253D2C]">Achievements Gallery</h2>
            <p className="text-xs text-[#477e57]">
              Prestige milestones celebrating continuous dedication and volume
            </p>
          </div>
          <span className="text-xs font-bold bg-[#CFFFDC] text-[#2E6F40] px-3 py-1 rounded-full border border-[#68BA7F]/40">
            {unlockedCount} / {badges.length} Unlocked
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-5 border transition flex flex-col justify-between space-y-3 ${
                b.unlocked
                  ? "bg-[#f8fdfa] border-[#68BA7F]/40 shadow-xs"
                  : "bg-[#fcfefd] border-dashed border-[#c9ebd6] opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl p-2.5 rounded-xl bg-[#CFFFDC] border border-[#68BA7F]/40 inline-block shadow-2xs">
                    {b.icon}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      b.unlocked
                        ? "bg-[#CFFFDC] text-[#2E6F40] border border-[#68BA7F]/40"
                        : "bg-[#e3f5eb] text-[#477e57]"
                    }`}
                  >
                    {b.unlocked ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-[#253D2C]">{b.name}</h3>
                  <p className="text-xs text-[#477e57] mt-1 leading-relaxed">{b.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2 border-t border-[#e3f5eb]">
                {b.unlocked ? (
                  <p className="text-[11px] font-bold text-[#2E6F40] flex items-center justify-between">
                    <span>Milestone Mastered 🎉</span>
                    {b.unlockedAt && (
                      <span className="text-[#68BA7F] font-normal">
                        {new Date(b.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#477e57] font-medium">
                      <span>Progress</span>
                      <span className="font-bold text-[#253D2C] font-mono">
                        {b.progress} / {b.target} {b.type === "streak" ? "days" : b.type === "minutes" ? "mins" : "goals"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#e3f5eb] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E6F40] rounded-full transition-all duration-500"
                        style={{ width: `${b.pct || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
