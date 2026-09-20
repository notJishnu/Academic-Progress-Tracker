import { useState, useEffect, useRef, useCallback } from "react";

// Web Audio API chime synthesis for distraction-free, reliable alerts
function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant chord notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  } catch {
    // Audio context may be restricted by browser until first interaction
  }
}

export default function FocusTimerModal({ goal, onClose, onCompleteGoal }) {
  const plannedSeconds = (goal?.plannedMinutes || 30) * 60;
  const [totalSeconds, setTotalSeconds] = useState(plannedSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(plannedSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mode, setMode] = useState("countdown"); // "countdown" | "stopwatch"
  const [zenMode, setZenMode] = useState(false);

  const timerRef = useRef(null);

  const handleFinish = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    playCompletionChime();
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === "countdown") {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleFinish();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setRemainingSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, mode, handleFinish]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const handleReset = () => {
    setIsActive(false);
    setIsFinished(false);
    setRemainingSeconds(mode === "countdown" ? totalSeconds : 0);
  };

  const addFiveMinutes = () => {
    if (mode === "countdown") {
      setTotalSeconds((prev) => prev + 300);
      setRemainingSeconds((prev) => prev + 300);
      setIsFinished(false);
    }
  };

  // Time calculations
  const displaySeconds = mode === "countdown" ? remainingSeconds : remainingSeconds;
  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Progress percentage for circular ring
  const progressPct =
    mode === "countdown"
      ? totalSeconds > 0
        ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100
        : 100
      : 100;

  // Actual minutes spent studied
  const elapsedMinutes =
    mode === "countdown"
      ? Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60))
      : Math.max(1, Math.round(remainingSeconds / 60));

  const handleSaveAndComplete = () => {
    onCompleteGoal(goal._id, elapsedMinutes);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        zenMode ? "bg-slate-950 text-slate-100" : "bg-slate-900/60 backdrop-blur-sm text-slate-800"
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative transition-all ${
          zenMode
            ? "bg-slate-900 border border-slate-800 text-white"
            : "bg-white border border-slate-100 text-slate-800"
        }`}
      >
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setMode("countdown");
                setRemainingSeconds(totalSeconds);
                setIsActive(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === "countdown"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : zenMode
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Countdown ({goal?.plannedMinutes || 30}m)
            </button>
            <button
              onClick={() => {
                setMode("stopwatch");
                setRemainingSeconds(0);
                setIsActive(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === "stopwatch"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : zenMode
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Stopwatch
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZenMode((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                zenMode ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Zen Mode: distraction-free dark study interface"
            >
              {zenMode ? "☀️ Normal" : "🌙 Zen"}
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg text-sm transition ${
                zenMode ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Close timer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Goal Title & Section Badge */}
        <div className="mb-6 max-w-sm">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-xs"
            style={{
              backgroundColor: goal?.section?.color ? `${goal.section.color}20` : "#e0e7ff",
              color: goal?.section?.color || "#4338ca",
            }}
          >
            ● {goal?.section?.name || "Academic Goal"}
          </span>
          <h2 className="text-xl font-bold truncate leading-snug">{goal?.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Planned: {goal?.plannedMinutes} mins · Stay in the zone
          </p>
        </div>

        {/* Animated Circular Progress Timer Ring */}
        <div className="relative w-56 h-56 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={zenMode ? "stroke-slate-800" : "stroke-slate-100"}
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={goal?.section?.color || "#6366f1"}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPct) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Centered Timer Readout */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-mono font-black tracking-tight">
              {timeFormatted}
            </span>
            <span
              className={`text-xs font-semibold tracking-wider uppercase mt-1 ${
                isActive ? "text-emerald-500 animate-pulse" : "text-slate-400"
              }`}
            >
              {isFinished ? "Session Done! 🎉" : isActive ? "Focusing..." : "Paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 my-6">
          <button
            onClick={handleReset}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              zenMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Reset
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-lg transition transform active:scale-95 ${
              isActive
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
            }`}
          >
            {isActive ? "⏸ Pause" : isFinished ? "▶ Restart" : "▶ Start Focus"}
          </button>

          {mode === "countdown" && (
            <button
              onClick={addFiveMinutes}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                zenMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Add 5 minutes to countdown"
            >
              +5 min
            </button>
          )}
        </div>

        {/* Action Button: Mark Goal Complete & Credit Time */}
        <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSaveAndComplete}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <span>✓</span> Complete Goal & Log {elapsedMinutes} mins
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Will credit {elapsedMinutes} mins towards today's study record, streak, and milestone badges.
          </p>
        </div>
      </div>
    </div>
  );
}
