import { useAuth } from "../../context/AuthContext";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-600",
  "from-blue-500 to-cyan-600",
];

function getGradient(name = "") {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}

export default function ProfilePanel({ badges = [], dailySummary = null }) {
  const { user } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  const gradient = getGradient(user?.name);

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
    <div className="p-6 max-w-lg mx-auto space-y-8">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-black shadow-lg`}
        >
          {initial}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {user?.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.email}
          </p>
          {joined && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Member since {joined}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Your Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked badges preview */}
      {unlockedCount > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            Badges Earned
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges
              .filter((b) => b.unlocked)
              .map((b) => (
                <div
                  key={b.id}
                  title={b.name}
                  className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-2xl shadow-sm"
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
