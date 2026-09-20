const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getIntensityClass(minutes, isActive) {
  if (!isActive && (!minutes || minutes <= 0)) return "bg-slate-100 hover:bg-slate-200";
  if (!minutes && isActive) return "bg-emerald-500 hover:bg-emerald-600";
  if (minutes < 30) return "bg-emerald-200 hover:bg-emerald-300";
  if (minutes < 60) return "bg-emerald-400 hover:bg-emerald-500";
  if (minutes < 120) return "bg-emerald-600 hover:bg-emerald-700";
  return "bg-emerald-800 hover:bg-emerald-900";
}

export default function StreakCalendar({ dates = [], dailyLogs = {} }) {
  const set = new Set(dates || []);
  const days = [];
  // 35 days (5 weeks)
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          📅 Study Streak Heatmap
          <span className="text-xs font-normal text-slate-400">(Last 5 Weeks)</span>
        </h2>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-100 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-200 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
          <span className="w-3 h-3 rounded-sm bg-emerald-800 inline-block" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap items-center">
        {days.map((d) => {
          const key = toKey(d);
          const active = set.has(key);
          const minutes = dailyLogs[key] || 0;
          const isToday = d.toDateString() === new Date().toDateString();
          const colorClass = getIntensityClass(minutes, active);

          const timeNote = minutes > 0 ? ` · ${minutes} mins studied` : active ? " · Completed goal" : " · No study logged";

          return (
            <div
              key={key}
              title={`${MONTHS[d.getMonth()]} ${d.getDate()}${timeNote}`}
              className={`w-5 h-5 rounded-sm transition cursor-pointer ${colorClass} ${
                isToday ? "ring-2 ring-indigo-500 ring-offset-1" : ""
              }`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
        <p>
          <span className="inline-block w-2.5 h-2.5 bg-emerald-600 rounded-sm align-middle mr-1.5"></span>
          Green tiles represent active study sessions · Ring highlights today
        </p>
      </div>
    </div>
  );
}
