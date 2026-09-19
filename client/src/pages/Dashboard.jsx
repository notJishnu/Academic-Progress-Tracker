import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSections, createSection, deleteSection,
  getGoals, createGoal, toggleGoal, deleteGoal,
} from "../lib/tracker";
import StreakCalendar from "../components/StreakCalender";


const COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"];

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [sections, setSections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [sectionColor, setSectionColor] = useState(COLORS[0]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [goalSection, setGoalSection] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [s, g] = await Promise.all([getSections(), getGoals()]);
      setSections(s.data);
      setGoals(g.data);
      if (!goalSection && s.data.length) setGoalSection(s.data[0]._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    }
  };

  useEffect(() => { load(); }, []);

  // --- Stats ---
  const todayStr = new Date().toDateString();
  const completedToday = goals.filter(
    (g) => g.completed && g.completedAt && new Date(g.completedAt).toDateString() === todayStr
  ).length;
  const plannedMinutes = goals.reduce((sum, g) => sum + (g.plannedMinutes || 0), 0);
  const doneMinutes = goals
    .filter((g) => g.completed)
    .reduce((sum, g) => sum + (g.plannedMinutes || 0), 0);

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

  const handleToggle = async (id) => { await toggleGoal(id); load(); refreshUser(); };
  const handleDeleteGoal = async (id) => { await deleteGoal(id); load(); };
  const handleDeleteSection = async (id) => { await deleteSection(id); load(); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">📈 Progress Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Hi, <b>{user?.name}</b></span>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
            🔥 {user?.currentStreak ?? 0} day streak
          </span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </nav>

      {/* Stats strip */}
      <div className="max-w-6xl mx-auto px-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Completed today</p>
          <p className="text-2xl font-bold text-indigo-600">
            {completedToday}<span className="text-base text-gray-400">/{goals.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Current streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {user?.currentStreak ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Best streak</p>
          <p className="text-2xl font-bold text-amber-500">🏆 {user?.longestStreak ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Minutes done</p>
          <p className="text-2xl font-bold text-green-600">
            {doneMinutes}<span className="text-base text-gray-400">/{plannedMinutes}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-2 pt-2">
        <StreakCalendar dates={user?.completedDates} />
      </div>


      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sections */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-3">Sections</h2>
            <form onSubmit={handleAddSection} className="space-y-2 mb-4">
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="New section name"
                className="w-full border rounded-lg px- focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setSectionColor(c)}
                    className={`w-6 h-6 rounded-full ${sectionColor === c ? "ring-2 ring-offset-2 ring-gray-800" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                + Add Section
              </button>
            </form>
            <ul className="space-y-2">
              {sections.map((s) => {
                const total = s.goals?.length || 0;
                const done = s.goals?.filter((g) => g.completed).length || 0;
                const pct = total ? (done / total) * 100 : 0;
                return (
                  <li key={s._id} className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text500">{done}/{total}</span>
                        <button onClick={() => handleDeleteSection(s._id)}
                          className="text-red-400 hover:text-red-600 text-sm">✕</button>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </li>
                );
              })}
              {!sections.length && <p className="text-gray-400 text-sm">No sections yet.</p>}
            </ul>
          </div>

          {/* Add Goal form */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-3">New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-2">
              <select value={goalSection} onChange={(e) => setGoalSection(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" required>
                <option value="" disabled>Select section</option>
                {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Goal title" className="w-full border rounded-lg px-3 py-2" required />
              <input type="number" min="5" step="5" value={goalMinutes}
                onChange={(e) => setGoalMinutes(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" required />
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                + Add Goal
              </button>
            </form>
          </div>
        </div>

        {/* Right: Goals */}
        <div className="lg:col-span-2">
          {error && <p className="mb-4 bg-red-700 px-4 py-2 rounded-lg">{error}</p>}
          <h2 className="font-bold text-lg mb-3">Goals</h2>
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g._id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <input type="checkbox" checked={g.completed}
                  onChange={() => handleToggle(g._id)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                <div className="flex-1">
                  <p className={`font-medium ${g.completed ? "line-through text-gray-400" : ""}`}>
                    {g.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {g.plannedMinutes} min · {g.section?.name}
                  </p>
                </div>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.section?.color }} />
                <button onClick={() => handleDeleteGoal(g._id)}
                  className="text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
            {!goals.length && (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                No goals yet — add one! 🎯
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
