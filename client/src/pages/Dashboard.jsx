import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSections, createSection, deleteSection,
  getGoals, createGoal, toggleGoal, deleteGoal,
  getBadges, getDailySummary,
} from "../lib/tracker";
import StreakCalendar from "../components/StreakCalender";
import BadgeShelf from "../components/BadgeShelf";
import TodayStudyBreakdown from "../components/TodayStudyBreakdown";
import FocusTimerModal from "../components/FocusTimerModal";
import AppLayout from "../components/AppLayout";

const COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();

  // ── Data state ───────────────────────────────────────────────────
  const [sections, setSections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [newBadgeAlert, setNewBadgeAlert] = useState(null);

  // ── Focus timer state ────────────────────────────────────────────
  const [activeTimerGoal, setActiveTimerGoal] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // ── Goal list filters ────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("all");   // all | active | completed
  const [filterSection, setFilterSection] = useState("all"); // all | sectionId

  // ── Form state ───────────────────────────────────────────────────
  const [sectionName, setSectionName] = useState("");
  const [sectionColor, setSectionColor] = useState(COLORS[0]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [goalSection, setGoalSection] = useState("");
  const [error, setError] = useState("");

  // ── Load data ────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [s, g, b, sum] = await Promise.all([
        getSections(),
        getGoals(),
        getBadges(),
        getDailySummary(),
      ]);
      setSections(s.data);
      setGoals(g.data);
      setBadges(b.data);
      setDailySummary(sum.data);
      setGoalSection((prev) => prev || (s.data.length ? s.data[0]._id : ""));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // ── Computed stats ───────────────────────────────────────────────
  const todayMinutes = dailySummary?.todayMinutes || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  const formattedTodayTime = todayHours > 0 ? `${todayHours}h ${todayMins}m` : `${todayMins}m`;
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  // ── Filtered goals ───────────────────────────────────────────────
  const filteredGoals = goals.filter((g) => {
    const statusOk =
      filterStatus === "all" ||
      (filterStatus === "active" && !g.completed) ||
      (filterStatus === "completed" && g.completed);
    const sectionOk =
      filterSection === "all" ||
      (g.section?._id || g.section) === filterSection;
    return statusOk && sectionOk;
  });

  const activeCount = goals.filter((g) => !g.completed).length;
  const completedCount = goals.filter((g) => g.completed).length;

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAddSection = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createSection({ name: sectionName, color: sectionColor });
      setSectionName("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create section");
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createGoal({ section: goalSection, title: goalTitle, plannedMinutes: Number(goalMinutes) });
      setGoalTitle("");
      setGoalMinutes(30);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create goal");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleGoal(id);
      await load();
      if (refreshUser) await refreshUser();
      if (res.data?.newBadges?.length > 0) setNewBadgeAlert(res.data.newBadges);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update goal");
    }
  };

  const handleTimerComplete = async (id, actualMinutes) => {
    try {
      const res = await toggleGoal(id, { actualMinutes });
      await load();
      if (refreshUser) await refreshUser();
      if (res.data?.newBadges?.length > 0) setNewBadgeAlert(res.data.newBadges);
      setTimerRunning(false);
      setActiveTimerGoal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete goal");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (activeTimerGoal?._id === id) { setActiveTimerGoal(null); setTimerRunning(false); }
    try {
      await deleteGoal(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete goal");
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await deleteSection(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete section");
    }
  };

  const openTimer = (goal) => { setActiveTimerGoal(goal); setTimerRunning(true); };
  const closeTimer = () => { setActiveTimerGoal(null); setTimerRunning(false); };

  // ── Render ───────────────────────────────────────────────────────
  const dashboardContent = (
    <div className="min-h-full pb-20 md:pb-6">

      {/* Focus Timer Modal */}
      {activeTimerGoal && (
        <FocusTimerModal
          goal={activeTimerGoal}
          onClose={closeTimer}
          onCompleteGoal={handleTimerComplete}
        />
      )}

      {/* Badge Unlock Celebration */}
      {newBadgeAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🎉</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Milestone Unlocked!</h3>
            <div className="my-4 space-y-3">
              {newBadgeAlert.map((b) => (
                <div key={b.id} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                  <span className="text-3xl block mb-1">{b.icon}</span>
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">{b.name}</h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">{b.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setNewBadgeAlert(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pt-6">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Studied Today", value: formattedTodayTime || "0m", sub: `${dailySummary?.completedTodayCount || 0} tasks done`, color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Current Streak", value: `🔥 ${user?.currentStreak ?? 0}`, sub: "Daily consistency", color: "text-orange-500" },
            { label: "Longest Streak", value: `🏆 ${user?.longestStreak ?? 0}`, sub: "Personal record", color: "text-amber-500" },
            { label: "Badges Earned", value: unlockedBadgesCount, sub: `out of ${badges.length}`, color: "text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Daily Breakdown + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayStudyBreakdown summary={dailySummary} />
          <StreakCalendar dates={user?.completedDates} dailyLogs={dailySummary?.dailyLogs || {}} />
        </div>

        {/* Sections + Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="space-y-5">

            {/* Sections card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-5">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">Sections / Subjects</h2>
              <form onSubmit={handleAddSection} className="space-y-2.5 mb-4">
                <input
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Data Structures, Calculus…"
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Color:</span>
                  <div className="flex gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSectionColor(c)}
                        className={`w-5 h-5 rounded-full transition ${sectionColor === c ? "ring-2 ring-offset-1 ring-slate-800 dark:ring-slate-200 scale-110" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <button className="w-full bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-indigo-700 transition">
                  + Add Section
                </button>
              </form>

              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {sections.map((s) => {
                  const sg = goals.filter((g) => (g.section?._id || g.section) === s._id);
                  const done = sg.filter((g) => g.completed).length;
                  const pct = sg.length ? Math.round((done / sg.length) * 100) : 0;
                  return (
                    <li key={s._id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-600">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{done}/{sg.length}</span>
                          <button onClick={() => handleDeleteSection(s._id)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                    </li>
                  );
                })}
                {!sections.length && (
                  <p className="text-slate-400 text-xs text-center py-4 italic">No sections yet — add one above!</p>
                )}
              </ul>
            </div>

            {/* New Goal form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-5">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">Add Study Goal</h2>
              <form onSubmit={handleAddGoal} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Section</label>
                  <select
                    value={goalSection}
                    onChange={(e) => setGoalSection(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="" disabled>Select section</option>
                    {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Goal / Topic</label>
                  <input
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Read Chapter 4 & solve problems"
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Planned Time (mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition shadow-sm">
                  + Add Study Goal
                </button>
              </form>
            </div>
          </div>

          {/* Right column: filtered goals list */}
          <div className="lg:col-span-2 space-y-3">

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "all", label: `All (${goals.length})` },
                  { key: "active", label: `Active (${activeCount})` },
                  { key: "completed", label: `Done (${completedCount})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      filterStatus === key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Sections</option>
                {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            {/* Goal cards */}
            <div className="space-y-2.5">
              {filteredGoals.map((g) => (
                <div
                  key={g._id}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 transition ${
                    g.completed
                      ? "border-slate-200 dark:border-slate-700 opacity-75"
                      : "border-slate-200/90 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={() => handleToggle(g._id)}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${g.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}`}>
                        {g.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-slate-500">⏱️ {g.plannedMinutes} mins</span>
                        {g.actualMinutes && g.actualMinutes !== g.plannedMinutes && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ {g.actualMinutes}m studied</span>
                        )}
                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: g.section?.color }}>
                          ● {g.section?.name}
                        </span>
                      </div>
                    </div>

                    {!g.completed && (
                      <button
                        onClick={() => openTimer(g)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTimerGoal?._id === g._id
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400"
                        }`}
                        title="Start a focus timer for this goal"
                      >
                        ⏱️ {activeTimerGoal?._id === g._id ? "Running…" : "Focus"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteGoal(g._id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 p-1 transition flex-shrink-0"
                      title="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {filteredGoals.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400 text-sm">
                  {goals.length === 0
                    ? "🎯 No goals yet — add one using the form on the left!"
                    : "🔍 No goals match the selected filters."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Badges */}
        <BadgeShelf badges={badges} />
      </main>
    </div>
  );

  return (
    <AppLayout
      badges={badges}
      dailySummary={dailySummary}
      timerRunning={timerRunning}
      timerGoalTitle={activeTimerGoal?.title || ""}
    >
      {dashboardContent}
    </AppLayout>
  );
}
