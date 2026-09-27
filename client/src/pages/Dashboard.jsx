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
import EduvaLogo from "../components/EduvaLogo";

const COLORS = ["#2E6F40", "#68BA7F", "#1e40af", "#d97706", "#dc2626", "#7c3aed"];

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
    <div className="min-h-full pb-16">

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
        <div className="fixed inset-0 bg-[#253D2C]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#c9ebd6]">
            <div className="w-14 h-14 bg-[#CFFFDC] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🎉</div>
            <h3 className="text-lg font-bold text-[#253D2C]">Milestone Unlocked!</h3>
            <div className="my-4 space-y-3">
              {newBadgeAlert.map((b) => (
                <div key={b.id} className="p-3 bg-[#e3f5eb] border border-[#68BA7F]/40 rounded-xl">
                  <span className="text-3xl block mb-1">{b.icon}</span>
                  <h4 className="font-bold text-sm text-[#253D2C]">{b.name}</h4>
                  <p className="text-xs text-[#376344] mt-0.5">{b.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setNewBadgeAlert(null)}
              className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white font-semibold py-2.5 rounded-xl text-sm transition"
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pt-6">

        {/* Top Header with Eduva Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#c9ebd6]">
          <div className="flex items-center gap-3">
            <EduvaLogo className="w-10 h-10 shadow-xs" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#253D2C] leading-tight">
                Eduva Dashboard
              </h1>
              <p className="text-xs text-[#477e57] font-medium">
                Welcome back, <b className="text-[#253D2C]">{user?.name}</b> · Stay consistent with your daily study goals!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#CFFFDC] text-[#2E6F40] border border-[#68BA7F]/40 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              🔥 {user?.currentStreak ?? 0} Day Streak
            </span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Studied Today", value: formattedTodayTime || "0m", sub: `${dailySummary?.completedTodayCount || 0} tasks done`, color: "text-[#2E6F40]" },
            { label: "Current Streak", value: `🔥 ${user?.currentStreak ?? 0}`, sub: "Daily consistency", color: "text-orange-600" },
            { label: "Longest Streak", value: `🏆 ${user?.longestStreak ?? 0}`, sub: "Personal record", color: "text-amber-600" },
            { label: "Badges Earned", value: `${unlockedBadgesCount} / ${badges.length}`, sub: "Milestones unlocked", color: "text-[#2E6F40]" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-xs border border-[#c9ebd6] p-4">
              <p className="text-xs font-medium text-[#477e57]">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-[#68BA7F] mt-0.5">{s.sub}</p>
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
            <div className="bg-white rounded-xl shadow-xs border border-[#c9ebd6] p-5">
              <h2 className="font-bold text-sm text-[#253D2C] mb-3 uppercase tracking-wide">Sections / Subjects</h2>
              <form onSubmit={handleAddSection} className="space-y-2.5 mb-4">
                <input
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Data Structures, Calculus…"
                  className="w-full border border-[#c9ebd6] bg-white text-[#253D2C] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#477e57] font-medium">Color:</span>
                  <div className="flex gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSectionColor(c)}
                        className={`w-5 h-5 rounded-full transition ${sectionColor === c ? "ring-2 ring-offset-1 ring-[#253D2C] scale-110" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <button className="w-full bg-[#2E6F40] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#253D2C] transition shadow-xs">
                  + Add Section
                </button>
              </form>

              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {sections.map((s) => {
                  const sg = goals.filter((g) => (g.section?._id || g.section) === s._id);
                  const done = sg.filter((g) => g.completed).length;
                  const pct = sg.length ? Math.round((done / sg.length) * 100) : 0;
                  return (
                    <li key={s._id} className="bg-[#f3fbf6] rounded-lg px-3 py-2 border border-[#c9ebd6]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-[#253D2C]">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#477e57] font-mono">{done}/{sg.length}</span>
                          <button onClick={() => handleDeleteSection(s._id)} className="text-[#68BA7F] hover:text-red-600 transition">✕</button>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[#e3f5eb] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: s.color || "#2E6F40" }} />
                      </div>
                    </li>
                  );
                })}
                {!sections.length && (
                  <p className="text-[#68BA7F] text-xs text-center py-4 italic">No sections yet — add one above!</p>
                )}
              </ul>
            </div>

            {/* New Goal form */}
            <div className="bg-white rounded-xl shadow-xs border border-[#c9ebd6] p-5">
              <h2 className="font-bold text-sm text-[#253D2C] mb-3 uppercase tracking-wide">Add Study Goal</h2>
              <form onSubmit={handleAddGoal} className="space-y-3">
                <div>
                  <label className="text-xs text-[#477e57] font-medium block mb-1">Section</label>
                  <select
                    value={goalSection}
                    onChange={(e) => setGoalSection(e.target.value)}
                    className="w-full border border-[#c9ebd6] bg-white text-[#253D2C] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
                    required
                  >
                    <option value="" disabled>Select section</option>
                    {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#477e57] font-medium block mb-1">Goal / Topic</label>
                  <input
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Read Chapter 4 & solve problems"
                    className="w-full border border-[#c9ebd6] bg-white text-[#253D2C] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#477e57] font-medium block mb-1">Planned Time (mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(e.target.value)}
                    className="w-full border border-[#c9ebd6] bg-white text-[#253D2C] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
                    required
                  />
                </div>
                <button className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white text-xs font-semibold py-2.5 rounded-lg transition shadow-xs">
                  + Add Study Goal
                </button>
              </form>
            </div>
          </div>

          {/* Right column: filtered goals list */}
          <div className="lg:col-span-2 space-y-3">

            {/* Filter bar */}
            <div className="bg-white rounded-xl shadow-xs border border-[#c9ebd6] px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "all", label: `All (${goals.length})` },
                  { key: "active", label: `Active (${activeCount})` },
                  { key: "completed", label: `Done (${completedCount})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filterStatus === key
                        ? "bg-[#2E6F40] text-white shadow-xs"
                        : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="text-xs border border-[#c9ebd6] bg-white text-[#253D2C] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#68BA7F]"
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
                  className={`bg-white rounded-xl shadow-xs border transition ${
                    g.completed
                      ? "border-[#e3f5eb] bg-[#f8fdfa] opacity-80 p-4"
                      : "border-[#c9ebd6] hover:border-[#68BA7F] hover:shadow-sm p-4"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={g.completed}
                      onChange={() => handleToggle(g._id)}
                      className="w-5 h-5 accent-[#2E6F40] rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${g.completed ? "line-through text-[#68BA7F]" : "text-[#253D2C]"}`}>
                        {g.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#477e57]">⏱️ {g.plannedMinutes} mins</span>
                        {g.actualMinutes && g.actualMinutes !== g.plannedMinutes && (
                          <span className="text-xs text-[#2E6F40] font-semibold">✓ {g.actualMinutes}m studied</span>
                        )}
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: g.section?.color || "#2E6F40" }}>
                          ● {g.section?.name}
                        </span>
                      </div>
                    </div>

                    {!g.completed && (
                      <button
                        onClick={() => openTimer(g)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTimerGoal?._id === g._id
                            ? "bg-[#2E6F40] text-white shadow-xs"
                            : "bg-[#e3f5eb] text-[#2E6F40] hover:bg-[#CFFFDC] border border-[#c9ebd6]"
                        }`}
                        title="Start a focus timer for this goal"
                      >
                        ⏱️ {activeTimerGoal?._id === g._id ? "Running…" : "Focus"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteGoal(g._id)}
                      className="text-[#68BA7F] hover:text-red-600 p-1 transition flex-shrink-0"
                      title="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {filteredGoals.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-[#c9ebd6] p-10 text-center text-[#477e57] text-sm">
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
