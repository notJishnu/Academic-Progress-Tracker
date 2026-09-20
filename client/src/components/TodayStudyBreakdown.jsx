export default function TodayStudyBreakdown({ summary }) {
  const todayMinutes = summary?.todayMinutes || 0;
  const hours = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;

  const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const sectionBreakdown = summary?.sectionBreakdown || [];
  const completedCount = summary?.completedTodayCount || 0;

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            ⏱️ Today's Study Log
          </h2>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            {completedCount} {completedCount === 1 ? "goal" : "goals"} done
          </span>
        </div>

        {/* Hero stat */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-emerald-50/70 rounded-xl p-4 border border-indigo-100/60 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Time Studied Today</p>
            <p className="text-3xl font-extrabold text-indigo-700 mt-0.5 tracking-tight">
              {formattedTime}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Total Lifetime</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {Math.floor((summary?.totalStudyMinutes || 0) / 60)}h {(summary?.totalStudyMinutes || 0) % 60}m
            </p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Subject Breakdown
          </h3>

          {sectionBreakdown.length > 0 ? (
            sectionBreakdown.map((sec) => {
              const secHours = Math.floor(sec.minutes / 60);
              const secMins = sec.minutes % 60;
              const timeStr = secHours > 0 ? `${secHours}h ${secMins}m` : `${secMins}m`;
              const pct = todayMinutes > 0 ? Math.round((sec.minutes / todayMinutes) * 100) : 0;

              return (
                <div key={sec.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sec.color }}
                      />
                      {sec.name}
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({sec.count} {sec.count === 1 ? "task" : "tasks"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                      <span className="font-semibold text-slate-800">{timeStr}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: sec.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center italic bg-slate-50 rounded-lg">
              No study recorded yet today. Complete a goal to log your focused minutes!
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>
          {todayMinutes >= 120
            ? "🔥 Exceptional study stamina today!"
            : todayMinutes >= 60
            ? "⭐ Strong focus session logged!"
            : todayMinutes > 0
            ? "🌱 Great start! Keep up the momentum."
            : "🎯 Ready to begin today's study journey?"}
        </span>
      </div>
    </div>
  );
}
