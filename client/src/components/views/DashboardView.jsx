export default function DashboardView({
  user,
  goals = [],
  sections = [],
  badges = [],
  dailySummary = null,
  onToggleGoal,
  onDeleteGoal,
  onOpenTimer,
  onNavigate,
  onAddGoalClick,
}) {
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const progressPct = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  // Calculate focused hours
  const totalStudyMinutes = (user?.totalStudyMinutes || dailySummary?.totalStudyMinutes || 0);
  const totalHours = (totalStudyMinutes / 60).toFixed(1);

  // Unlocked & recent badges
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const displayBadges = unlockedBadges.length > 0 ? unlockedBadges.slice(0, 4) : badges.slice(0, 3);

  // Heatmap sample days
  const dailyLogs = dailySummary?.dailyLogs || {};
  const heatmapDays = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const minutes = dailyLogs[key] || 0;
    const active = user?.completedDates?.includes(key);
    heatmapDays.push({ key, minutes, active });
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#c9ebd6]">
        <div>
          <h1 className="text-2xl font-black text-[#253D2C] leading-tight">
            Eduva Dashboard
          </h1>
          <p className="text-xs text-[#477e57] font-medium mt-0.5">
            Welcome back, <b className="text-[#253D2C]">{user?.name}</b>. You have {activeGoals.length} study targets queued for today.
          </p>
        </div>

        <button
          onClick={() => onNavigate("timer")}
          className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span>⚡</span>
          <span>Quick-Start Timer</span>
        </button>
      </div>

      {/* ── 3 Key Metrics Cards (Screenshot 2) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-5 border border-[#c9ebd6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl text-amber-500 shrink-0">
            ⚡
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#68BA7F] uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-black text-[#253D2C] mt-0.5">{user?.currentStreak ?? 0} Days</p>
          </div>
        </div>

        {/* Hours Focused */}
        <div className="bg-white rounded-2xl p-5 border border-[#c9ebd6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#CFFFDC] border border-[#68BA7F]/40 flex items-center justify-center text-2xl text-[#2E6F40] shrink-0">
            ⏱️
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#68BA7F] uppercase tracking-wider">Hours Focused</p>
            <p className="text-2xl font-black text-[#253D2C] mt-0.5">{totalHours} Hours</p>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#c9ebd6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-[#c9ebd6] flex items-center justify-center text-2xl text-[#2E6F40] shrink-0">
            ✅
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#68BA7F] uppercase tracking-wider">Task Progress</p>
            <p className="text-2xl font-black text-[#253D2C] mt-0.5">{progressPct}% Complete</p>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Today's Study Plan + Habit Consistency */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Plan */}
          <div className="bg-white rounded-2xl border border-[#c9ebd6] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3f5eb]">
              <div>
                <h2 className="text-base font-black text-[#253D2C]">Today's Study Plan</h2>
                <p className="text-xs text-[#477e57]">Check off targets after concluding focused study blocks</p>
              </div>
              <button
                onClick={onAddGoalClick}
                className="text-xs font-bold text-[#2E6F40] hover:text-[#253D2C] bg-[#e3f5eb] hover:bg-[#CFFFDC] px-3 py-1.5 rounded-lg transition"
              >
                + Add Target
              </button>
            </div>

            {/* Goals list */}
            <div className="space-y-2.5">
              {goals.map((g) => (
                <div
                  key={g._id}
                  className={`rounded-xl p-3.5 border transition flex items-center justify-between gap-3 ${
                    g.completed
                      ? "bg-[#f8fdfa] border-[#e3f5eb] opacity-80"
                      : "bg-white border-[#c9ebd6] hover:border-[#68BA7F] shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={() => onToggleGoal(g._id)}
                      className="w-5 h-5 accent-[#2E6F40] rounded cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${g.completed ? "line-through text-[#68BA7F]" : "text-[#253D2C]"}`}>
                        {g.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#477e57]">
                        <span className="font-semibold flex items-center gap-1" style={{ color: g.section?.color || "#2E6F40" }}>
                          ● {g.section?.name || "General"}
                        </span>
                        <span>·</span>
                        <span>{g.plannedMinutes} min</span>
                        {g.actualMinutes && (
                          <span className="text-[#2E6F40] font-bold">({g.actualMinutes}m logged)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!g.completed && (
                      <button
                        onClick={() => onOpenTimer(g)}
                        className="bg-[#CFFFDC] hover:bg-[#68BA7F] hover:text-white text-[#2E6F40] px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        title="Start timer for this target"
                      >
                        <span>⏱️</span>
                        <span>Focus</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteGoal(g._id)}
                      className="text-[#68BA7F] hover:text-red-600 p-1 text-xs"
                      title="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {goals.length === 0 && (
                <div className="text-center py-8 text-[#477e57] text-xs bg-[#f8fdfa] rounded-xl border border-dashed border-[#c9ebd6]">
                  No study targets queued today. Click <b className="text-[#2E6F40] cursor-pointer" onClick={onAddGoalClick}>+ Add Target</b> to plan your day!
                </div>
              )}
            </div>
          </div>

          {/* Habit Consistency Heatmap */}
          <div className="bg-white rounded-2xl border border-[#c9ebd6] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#253D2C] uppercase tracking-wider">Habit Consistency</span>
              <span className="text-[#68BA7F] font-semibold">Last 4 Weeks</span>
            </div>

            <div className="flex gap-1.5 flex-wrap items-center pt-1">
              {heatmapDays.map((d) => {
                let color = "bg-[#e3f5eb]";
                if (d.minutes >= 120) color = "bg-[#253D2C]";
                else if (d.minutes >= 60) color = "bg-[#2E6F40]";
                else if (d.minutes >= 30) color = "bg-[#68BA7F]";
                else if (d.minutes > 0 || d.active) color = "bg-[#CFFFDC]";

                return (
                  <div
                    key={d.key}
                    title={`${d.key}: ${d.minutes} mins studied`}
                    className={`w-6 h-6 rounded-md transition cursor-pointer ${color}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#477e57] pt-2 border-t border-[#e3f5eb]">
              <span>Green tiles represent daily study momentum</span>
              <button onClick={() => onNavigate("milestones")} className="text-[#2E6F40] font-bold hover:underline">
                View Full Heatmap →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Honor Badges */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#c9ebd6] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3f5eb]">
              <h2 className="text-base font-black text-[#253D2C]">Recent Honor Badges</h2>
              <button
                onClick={() => onNavigate("milestones")}
                className="text-xs font-bold text-[#2E6F40] hover:underline"
              >
                View All ({badges.length})
              </button>
            </div>

            <div className="space-y-3">
              {displayBadges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                    b.unlocked
                      ? "bg-[#f8fdfa] border-[#68BA7F]/40 shadow-2xs"
                      : "bg-[#fcfefd] border-dashed border-[#c9ebd6] opacity-75"
                  }`}
                >
                  <span className="text-2xl p-1.5 rounded-lg bg-[#CFFFDC] border border-[#68BA7F]/30 shrink-0">
                    {b.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-[#253D2C] truncate">{b.name}</p>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#CFFFDC] text-[#2E6F40]">
                        {b.unlocked ? "Unlocked" : b.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#477e57] mt-0.5 line-clamp-2 leading-tight">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate("milestones")}
              className="w-full py-2.5 rounded-xl border border-[#c9ebd6] text-xs font-bold text-[#2E6F40] hover:bg-[#e3f5eb] transition text-center"
            >
              Browse All Badges & Streaks
            </button>
          </div>

          {/* Quick Subject Overview */}
          <div className="bg-white rounded-2xl border border-[#c9ebd6] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3f5eb]">
              <h3 className="text-sm font-black text-[#253D2C]">Registered Subjects</h3>
              <button
                onClick={() => onNavigate("subjects")}
                className="text-xs font-bold text-[#2E6F40] hover:underline"
              >
                Manage ({sections.length})
              </button>
            </div>

            <div className="space-y-2">
              {sections.slice(0, 4).map((sec) => (
                <div key={sec._id} className="flex items-center justify-between text-xs py-1">
                  <span className="font-bold flex items-center gap-2 text-[#253D2C]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color || "#2E6F40" }} />
                    {sec.name}
                  </span>
                  <button
                    onClick={() => onNavigate("subjects")}
                    className="text-[11px] text-[#477e57] hover:text-[#2E6F40]"
                  >
                    Details →
                  </button>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-xs text-[#477e57] italic text-center py-2">
                  No subjects registered yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
