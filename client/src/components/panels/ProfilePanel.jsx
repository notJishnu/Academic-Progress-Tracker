import { useAuth } from "../../context/AuthContext";

export default function ProfilePanel({ badges = [], dailySummary = null }) {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  const totalHours = Math.floor((user?.totalStudyMinutes || 0) / 60);
  const totalMins = (user?.totalStudyMinutes || 0) % 60;
  const formattedTotal =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const stats = [
    { label: "Goals Completed", value: user?.completedGoalsCount ?? 0, icon: "🎯" },
    { label: "Total Studied", value: formattedTotal || "0m", icon: "⏱️" },
    { label: "Current Streak", value: `${user?.currentStreak ?? 0} days`, icon: "🔥" },
    { label: "Longest Streak", value: `${user?.longestStreak ?? 0} days`, icon: "🏆" },
    { label: "Badges Earned", value: `${unlockedCount} / ${badges.length}`, icon: "🎖️" },
    {
      label: "Studied Today",
      value: (() => {
        const m = dailySummary?.todayMinutes || 0;
        const h = Math.floor(m / 60);
        return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
      })(),
      icon: "📅",
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] flex items-center justify-center text-[#CFFFDC] text-4xl font-black shadow-md border-4 border-white">
          {initial}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#253D2C]">
            {user?.name}
          </h2>
          <p className="text-sm font-medium text-[#477e57] mt-0.5">
            {user?.email}
          </p>
          {joined && (
            <p className="text-xs text-[#68BA7F] mt-1 font-medium">
              Member since {joined}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-xs font-bold text-[#477e57] uppercase tracking-widest mb-3">
          Academic Progress Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[#c9ebd6] rounded-xl p-4 shadow-xs"
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xl font-black text-[#253D2C] mt-1.5">
                {s.value}
              </p>
              <p className="text-xs text-[#477e57] mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked badges preview */}
      {unlockedCount > 0 && (
        <div className="bg-white border border-[#c9ebd6] rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#477e57] uppercase tracking-widest mb-3">
            Unlocked Milestone Badges ({unlockedCount})
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {badges
              .filter((b) => b.unlocked)
              .map((b) => (
                <div
                  key={b.id}
                  title={`${b.name} - ${b.description}`}
                  className="w-13 h-13 rounded-xl bg-[#CFFFDC] border border-[#68BA7F] flex items-center justify-center text-2xl shadow-xs cursor-pointer hover:scale-105 transition"
                >
                  {b.icon}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
