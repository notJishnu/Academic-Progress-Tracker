import { useState, useEffect, useRef, useCallback } from "react";

// Web Audio chime for focus session complete
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + idx * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  } catch {
    // audio fallback
  }
}

export default function FocusTimerView({
  sections = [],
  goals = [],
  dailySummary = null,
  initialSection = null,
  onCompleteSession,
}) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    initialSection?._id || (sections.length > 0 ? sections[0]._id : "")
  );

  const [presetMinutes, setPresetMinutes] = useState(25);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customInput, setCustomInput] = useState(30);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const timerRef = useRef(null);

  const handleFinish = useCallback(() => {
    setIsActive(false);
    playChime();
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, handleFinish]);

  const selectPreset = (mins) => {
    setPresetMinutes(mins);
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsActive(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const mins = Math.max(1, Number(customInput) || 25);
    selectPreset(mins);
    setShowCustomModal(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setRemainingSeconds(totalSeconds);
  };

  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = hrs > 0
    ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const elapsedSeconds = totalSeconds - remainingSeconds;
  const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const handleSaveSession = () => {
    // Find matching goal for this section, or trigger complete session
    const matchingGoal = goals.find((g) => (g.section?._id || g.section) === selectedSectionId && !g.completed) || goals[0];
    const goalId = matchingGoal?._id;
    onCompleteSession(goalId, elapsedMinutes);
    resetTimer();
  };

  // Completed sessions today
  const todayMinutes = dailySummary?.todayMinutes || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  const formattedTodayTime = todayHours > 0 ? `${todayHours}h ${todayMins}m` : `${todayMins}m`;

  const completedTodayGoals = goals.filter((g) => g.completed);

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="pb-2 border-b border-[#c9ebd6]">
        <h1 className="text-2xl font-black text-[#253D2C] leading-tight">
          Deep Work Forge
        </h1>
        <p className="text-xs text-[#477e57] font-medium mt-0.5">
          Eliminate multitasking. Select your context module, anchor your duration, and plunge into flow.
        </p>
      </div>

      {/* ── Main Timer Card (Screenshot 3) ──────────────────── */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#c9ebd6] shadow-sm p-6 sm:p-8 space-y-6 text-center">
        {/* Module / Subject Selector */}
        <div className="flex items-center justify-center">
          <div className="relative inline-block w-full max-w-xs">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full bg-[#f8fdfa] border border-[#c9ebd6] text-[#253D2C] font-bold text-xs py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#68BA7F] appearance-none text-center cursor-pointer shadow-2xs"
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  📖 {s.name}
                </option>
              ))}
              {sections.length === 0 && (
                <option value="">No subjects registered</option>
              )}
            </select>
          </div>
        </div>

        {/* Preset Duration Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {[25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => selectPreset(m)}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                presetMinutes === m
                  ? "bg-[#2E6F40] text-white shadow-xs"
                  : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
              }`}
            >
              {m} Min
            </button>
          ))}
          <button
            onClick={() => setShowCustomModal(true)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              ![25, 45, 60].includes(presetMinutes)
                ? "bg-[#2E6F40] text-white shadow-xs"
                : "bg-[#e3f5eb] text-[#253D2C] hover:bg-[#CFFFDC]"
            }`}
          >
            Custom {![25, 45, 60].includes(presetMinutes) && `(${presetMinutes}m)`}
          </button>
        </div>

        {/* Timer Display Readout */}
        <div className="py-6 flex flex-col items-center">
          <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-[#253D2C]">
            {timeFormatted}
          </div>
          <p
            className={`text-xs font-black tracking-widest uppercase mt-3 px-3 py-1 rounded-full ${
              isActive
                ? "bg-[#CFFFDC] text-[#2E6F40] animate-pulse"
                : "bg-[#e3f5eb] text-[#477e57]"
            }`}
          >
            {isActive ? "POMODORO ACTIVE" : remainingSeconds === 0 ? "SESSION COMPLETE 🎉" : "READY FOR FLOW"}
          </p>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Reset button */}
          <button
            onClick={resetTimer}
            className="w-11 h-11 rounded-2xl bg-[#e3f5eb] hover:bg-[#CFFFDC] text-[#477e57] hover:text-[#253D2C] font-bold text-sm transition flex items-center justify-center shadow-2xs"
            title="Reset timer"
          >
            ↺
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={() => setIsActive((p) => !p)}
            className="w-16 h-16 rounded-full bg-[#2E6F40] hover:bg-[#253D2C] text-white text-2xl font-black transition shadow-lg shadow-[#2E6F40]/30 hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            {isActive ? "⏸" : "▶"}
          </button>

          {/* Complete & Log Button */}
          <button
            onClick={handleSaveSession}
            disabled={elapsedSeconds < 30}
            className="px-4 py-3 rounded-2xl bg-[#CFFFDC] hover:bg-[#68BA7F] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-[#2E6F40] font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
            title="Complete & Log Focused Minutes"
          >
            <span>✓</span>
            <span>Log ({elapsedMinutes}m)</span>
          </button>
        </div>
      </div>

      {/* ── Today's Sessions Log (Screenshot 3) ──────────────── */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#c9ebd6] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e3f5eb]">
          <h2 className="text-sm font-black text-[#253D2C]">Today's Sessions</h2>
          <span className="text-xs font-bold text-[#2E6F40]">
            Total: {formattedTodayTime} focused
          </span>
        </div>

        <div className="space-y-2.5">
          {completedTodayGoals.map((g) => (
            <div
              key={g._id}
              className="flex items-center justify-between py-2 px-3 bg-[#f8fdfa] rounded-xl border border-[#e3f5eb] text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#2E6F40]">⏱️</span>
                <span className="font-bold text-[#253D2C]">{g.section?.name || "General"}</span>
                <span className="text-[11px] text-[#68BA7F]">· {g.title}</span>
              </div>
              <span className="font-bold text-[#2E6F40] font-mono">
                {g.actualMinutes || g.plannedMinutes} min
              </span>
            </div>
          ))}

          {completedTodayGoals.length === 0 && (
            <p className="text-xs text-[#477e57] text-center py-4 italic">
              No completed sessions recorded yet today. Run the timer above to log your deep work!
            </p>
          )}
        </div>
      </div>

      {/* ── Custom Duration Modal ───────────────────────────── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-[#253D2C]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-[#c9ebd6] space-y-4">
            <h3 className="font-black text-base text-[#253D2C]">Set Custom Duration</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#477e57] block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 25, 90, 240"
                  className="w-full border border-[#c9ebd6] rounded-xl p-2.5 text-sm font-bold text-center text-[#253D2C] focus:outline-none focus:ring-2 focus:ring-[#68BA7F]"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 border border-[#c9ebd6] text-xs font-bold text-[#477e57] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2E6F40] text-white text-xs font-bold rounded-xl"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
