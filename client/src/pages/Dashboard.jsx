import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSections, createSection, deleteSection,
  getGoals, createGoal, toggleGoal, deleteGoal,
  getBadges, getDailySummary, logSession,
} from "../lib/tracker";
import AppLayout from "../components/AppLayout";
import DashboardView from "../components/views/DashboardView";
import SubjectsView from "../components/views/SubjectsView";
import FocusTimerView from "../components/views/FocusTimerView";
import MilestonesView from "../components/views/MilestonesView";
import LeaderboardView from "../components/views/LeaderboardView";
import SettingsPanel from "../components/panels/SettingsPanel";
import FocusTimerModal from "../components/FocusTimerModal";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();

  // ── Navigation & Shell State ─────────────────────────────────────
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  // ── Data State ───────────────────────────────────────────────────
  const [sections, setSections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [newBadgeAlert, setNewBadgeAlert] = useState(null);
  const [error, setError] = useState("");

  // ── Timer & Context State ────────────────────────────────────────
  const [activeTimerGoal, setActiveTimerGoal] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitialSection, setTimerInitialSection] = useState(null);

  // ── Add Goal Modal State ─────────────────────────────────────────
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalSection, setNewGoalSection] = useState("");
  const [newGoalMinutes, setNewGoalMinutes] = useState(30);
  const [addGoalLoading, setAddGoalLoading] = useState(false);

  // ── Load All Tracker Data ────────────────────────────────────────
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
      setNewGoalSection((prev) => prev || (s.data.length ? s.data[0]._id : ""));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tracker data");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAddSection = async (data) => {
    const res = await createSection(data);
    await load();
    return res;
  };

  const handleDeleteSection = async (id) => {
    try {
      await deleteSection(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete section");
    }
  };

  const handleCreateGoalSubmit = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalSection) return;
    setAddGoalLoading(true);
    try {
      await createGoal({
        section: newGoalSection,
        title: newGoalTitle.trim(),
        plannedMinutes: Number(newGoalMinutes) || 30,
      });
      setNewGoalTitle("");
      setNewGoalMinutes(30);
      setShowAddGoalModal(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create study goal");
    } finally {
      setAddGoalLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleGoal(id);
      await load();
      if (refreshUser) await refreshUser();
      if (res.data?.newBadges?.length > 0) setNewBadgeAlert(res.data.newBadges);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update target");
    }
  };

  const handleTimerComplete = async (sessionData, maybeMinutes) => {
    try {
      let payload;
      if (typeof sessionData === "object" && sessionData !== null) {
        payload = sessionData;
      } else {
        payload = {
          goalId: sessionData,
          minutes: Number(maybeMinutes) || 1,
        };
      }

      const res = await logSession(payload);
      await load();
      if (refreshUser) await refreshUser();
      if (res?.data?.newBadges?.length > 0) setNewBadgeAlert(res.data.newBadges);
      setTimerRunning(false);
      setActiveTimerGoal(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to log study session");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (activeTimerGoal?._id === id) {
      setActiveTimerGoal(null);
      setTimerRunning(false);
    }
    try {
      await deleteGoal(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete target");
    }
  };

  const openTimerForGoal = (goal) => {
    setActiveTimerGoal(goal);
    setTimerRunning(true);
  };

  const startTimerForSubject = (section) => {
    setTimerInitialSection(section);
    setActivePage("timer");
  };

  // ── Render Active View ───────────────────────────────────────────
  const renderActiveView = () => {
    switch (activePage) {
      case "subjects":
        return (
          <SubjectsView
            sections={sections}
            goals={goals}
            dailySummary={dailySummary}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onStartTimerForSubject={startTimerForSubject}
          />
        );
      case "timer":
        return (
          <FocusTimerView
            sections={sections}
            goals={goals}
            dailySummary={dailySummary}
            initialSection={timerInitialSection}
            onCompleteSession={handleTimerComplete}
          />
        );
      case "milestones":
        return (
          <MilestonesView
            user={user}
            badges={badges}
            dailySummary={dailySummary}
          />
        );
      case "leaderboard":
        return <LeaderboardView user={user} />;
      case "settings":
        return <SettingsPanel />;
      case "dashboard":
      default:
        return (
          <DashboardView
            user={user}
            goals={goals}
            sections={sections}
            badges={badges}
            dailySummary={dailySummary}
            onToggleGoal={handleToggle}
            onDeleteGoal={handleDeleteGoal}
            onOpenTimer={openTimerForGoal}
            onNavigate={setActivePage}
            onAddGoalClick={() => setShowAddGoalModal(true)}
          />
        );
    }
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((p) => !p)}
      timerRunning={timerRunning}
      timerGoalTitle={activeTimerGoal?.title || (timerInitialSection ? timerInitialSection.name : "")}
    >
      {/* ── Global Error Notification ─────────────────────── */}
      {error && (
        <div className="mb-5 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-2xl text-xs font-semibold flex justify-between items-center shadow-xs">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold ml-4 hover:opacity-80">✕</button>
        </div>
      )}

      {/* ── Modal Focus Timer (when launching from goal card) ─ */}
      {activeTimerGoal && (
        <FocusTimerModal
          goal={activeTimerGoal}
          onClose={() => {
            setActiveTimerGoal(null);
            setTimerRunning(false);
          }}
          onCompleteGoal={handleTimerComplete}
        />
      )}

      {/* ── Badge Unlock Celebration Modal ──────────────────── */}
      {newBadgeAlert && (
        <div className="fixed inset-0 bg-[#253D2C]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#c9ebd6]">
            <div className="w-14 h-14 bg-[#CFFFDC] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🎉</div>
            <h3 className="text-lg font-black text-[#253D2C]">Milestone Unlocked!</h3>
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
              className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── Add Target Modal ────────────────────────────────── */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-[#253D2C]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c9ebd6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
              <h2 className="text-base font-black text-[#253D2C]">Add Study Target</h2>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="text-[#68BA7F] hover:text-[#253D2C] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Subject / Section</label>
                <select
                  value={newGoalSection}
                  onChange={(e) => setNewGoalSection(e.target.value)}
                  className="w-full border border-[#c9ebd6] bg-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#68BA7F] text-[#253D2C]"
                  required
                >
                  <option value="" disabled>Select subject</option>
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {sections.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Please register a subject first in the "My Subjects" tab!
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Goal / Topic Title</label>
                <input
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Read Chapter 4 & solve problems"
                  className="w-full border border-[#c9ebd6] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#68BA7F] text-[#253D2C]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Planned Minutes</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newGoalMinutes}
                  onChange={(e) => setNewGoalMinutes(e.target.value)}
                  className="w-full border border-[#c9ebd6] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#68BA7F] text-[#253D2C]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2.5 border border-[#c9ebd6] text-xs font-bold text-[#477e57] rounded-xl hover:bg-[#e3f5eb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addGoalLoading || !newGoalTitle.trim() || !newGoalSection}
                  className="flex-1 py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {addGoalLoading ? "Adding…" : "Add Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Active View Content ─────────────────────────────── */}
      {renderActiveView()}
    </AppLayout>
  );
}
