const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StreakCalendar({ dates }) {
  const set = new Set(dates || []);
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="font-bold text-lg mb-3">Last 5 weeks</h2>
      <div className="flex gap-1 flex-wrap">
        {days.map((d) => {
          const active = set.has(toKey(d));
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={toKey(d)}
              title={`MONTHS[d.getMonth()]{MONTHS[d.getMonth()]}MONTHS[d.getMonth()]{d.getDate()}${active ? " — completed! ✅" : ""}`}
              className={`w-4 h-4 rounded-sm ${active ? "bg-green-500" : "bg-gray-100"} 
                ${isToday ? "ring-2 ring-indigo-400" : ""}`} />
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        <span className="inline-block w-3 h-3 bg-green-500 rounded-sm align-middle mr-1"></span>
        day with a completed goal · ring = today
      </p>
    </div>
  );
}
