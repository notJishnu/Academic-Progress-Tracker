import { useState } from "react";

const COLORS = ["#2E6F40", "#68BA7F", "#1e40af", "#d97706", "#dc2626", "#7c3aed"];

export default function SubjectsView({
  sections = [],
  goals = [],
  dailySummary = null,
  onAddSection,
  onDeleteSection,
  onStartTimerForSubject,
}) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [targetHours, setTargetHours] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onAddSection({
        name: name.trim(),
        color,
        targetHours: Math.max(1, Number(targetHours) || 20),
      });
      setName("");
      setColor(COLORS[0]);
      setTargetHours(25);
      setShowModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  // Group goals and calculate stats per subject
  const sectionBreakdown = dailySummary?.sectionBreakdown || [];

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#c9ebd6]">
        <div>
          <h1 className="text-2xl font-black text-[#253D2C] leading-tight">
            Registered Subjects
          </h1>
          <p className="text-xs text-[#477e57] font-medium mt-0.5">
            Manage your module tracking parameters, view aggregated statistics, and spark focus timers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Register New Subject</span>
        </button>
      </div>

      {/* ── Subjects Cards List (Screenshot 2) ──────────────── */}
      <div className="space-y-4">
        {sections.map((sec, idx) => {
          // Goals for this section
          const secGoals = goals.filter((g) => (g.section?._id || g.section) === sec._id);
          const completedGoals = secGoals.filter((g) => g.completed);
          
          // Calculate minutes
          const breakdownItem = sectionBreakdown.find((b) => b.name === sec.name);
          const loggedMins = breakdownItem?.minutes || secGoals.reduce((sum, g) => sum + (g.actualMinutes || (g.completed ? g.plannedMinutes : 0)), 0);
          const loggedHours = (loggedMins / 60).toFixed(1);
          
          // Semester target hours from subject configuration or fallback
          const targetHours = sec.targetHours || (20 + (idx % 3) * 5);
          const pct = Math.min(100, Math.round((Number(loggedHours) / targetHours) * 100));

          return (
            <div
              key={sec._id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c9ebd6] shadow-xs hover:border-[#68BA7F] transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left subject info */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Subject Color Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white font-black shrink-0 shadow-xs"
                  style={{ backgroundColor: sec.color || "#2E6F40" }}
                >
                  {sec.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-black text-base text-[#253D2C] truncate">{sec.name}</h3>
                    <span className="text-[11px] font-bold text-[#68BA7F]">
                      {secGoals.length} {secGoals.length === 1 ? "task" : "tasks"} ({completedGoals.length} completed)
                    </span>
                  </div>

                  {/* Progress Bar & Hours */}
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex justify-between text-xs font-semibold text-[#477e57]">
                      <span>Progress toward semester target: {pct}%</span>
                      <span className="font-bold text-[#253D2C] font-mono">{loggedHours} hrs / {targetHours} hrs</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#e3f5eb] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: sec.color || "#2E6F40" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onStartTimerForSubject(sec)}
                  className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>▶</span>
                  <span>Start Timer</span>
                </button>
                <button
                  onClick={() => onDeleteSection(sec._id)}
                  className="p-2 text-[#68BA7F] hover:text-red-600 hover:bg-red-50 rounded-xl transition text-xs font-bold"
                  title="Delete subject"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#c9ebd6] p-8 space-y-3">
            <span className="text-4xl block">📖</span>
            <h3 className="font-bold text-base text-[#253D2C]">No Registered Subjects Yet</h3>
            <p className="text-xs text-[#477e57] max-w-sm mx-auto">
              Start by registering your academic subjects to track modular hours and ignite Pomodoro timers.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#2E6F40] hover:bg-[#253D2C] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
            >
              + Register First Subject
            </button>
          </div>
        )}
      </div>

      {/* ── Register New Subject Modal ──────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#253D2C]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c9ebd6] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
              <h2 className="text-lg font-black text-[#253D2C]">Register New Subject</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#68BA7F] hover:text-[#253D2C] font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Subject / Module Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Chemistry II, Calculus III"
                  className="w-full border border-[#c9ebd6] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] text-[#253D2C]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Target Study Hours</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    placeholder="e.g. 20, 30, 50"
                    className="w-full border border-[#c9ebd6] rounded-xl px-3.5 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] text-[#253D2C]"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#68BA7F] pointer-events-none">
                    hours
                  </span>
                </div>
                <p className="text-[11px] text-[#477e57] mt-1">
                  Total focus hours you aim to complete for this subject this term.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Theme Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-[#253D2C] scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#c9ebd6] rounded-xl text-xs font-bold text-[#477e57] hover:bg-[#e3f5eb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {loading ? "Registering…" : "Register Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
