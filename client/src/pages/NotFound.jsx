import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  RotateCcw,
  Shuffle,
  Home,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import EduvaLogo from "../components/EduvaLogo";

// Curated dictionary of academic, productivity, mindfulness, and everyday words (Monkeytype-style)
const WORD_BANK = [
  "about", "above", "academic", "accept", "action", "achieve", "adapt", "after",
  "again", "almost", "always", "balance", "bamboo", "basic", "become", "before",
  "begin", "belief", "better", "beyond", "brain", "brave", "break", "bright",
  "build", "calm", "cause", "center", "change", "clarity", "climb", "commit",
  "concept", "connect", "constant", "create", "curious", "daily", "deep",
  "define", "design", "detail", "develop", "direct", "discipline", "discover",
  "dream", "during", "early", "effort", "enable", "energy", "engage", "engine",
  "enough", "equal", "escape", "every", "expand", "expert", "explore", "factor",
  "faster", "figure", "finish", "flame", "flight", "focus", "forest", "formal",
  "forward", "future", "gather", "genius", "gentle", "global", "grace", "great",
  "green", "ground", "growth", "guide", "habit", "happen", "honest", "horizon",
  "impact", "improve", "insight", "inspire", "intend", "invent", "journey",
  "judge", "keen", "keep", "kind", "learn", "lesson", "level", "light",
  "limit", "logic", "master", "matter", "measure", "memory", "mental", "method",
  "mind", "minute", "mission", "moment", "motion", "motive", "moving", "natural",
  "nature", "neural", "noble", "number", "object", "obtain", "online", "option",
  "order", "origin", "panda", "patient", "pattern", "peace", "persist", "phase",
  "planet", "pocket", "poise", "power", "practice", "precise", "prepare",
  "process", "prompt", "pursue", "quiet", "random", "reach", "reason", "record",
  "refine", "reflect", "repeat", "rescue", "resolve", "result", "reward",
  "rhythm", "rising", "routine", "sacred", "sample", "scholar", "school",
  "science", "search", "season", "secret", "select", "serene", "settle",
  "signal", "silent", "simple", "skill", "sleepy", "smooth", "solve", "spark",
  "spirit", "spring", "stable", "steady", "stream", "strike", "strive", "strong",
  "student", "study", "subtle", "system", "target", "theory", "thinking",
  "thrive", "time", "token", "track", "travel", "true", "trust", "unfold",
  "unique", "unlock", "value", "venture", "vision", "vital", "wisdom", "wonder",
];

// Generates a random sequence of words without consecutive duplicates
function generateRandomWords(count = 15) {
  const result = [];
  let lastWord = "";
  for (let i = 0; i < count; i++) {
    let word;
    do {
      word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    } while (word === lastWord && WORD_BANK.length > 1);
    result.push(word);
    lastWord = word;
  }
  return result.join(" ");
}

const WORD_COUNT_OPTIONS = [10, 15, 25];

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Typing Game State ──────────────────────────────────────────────
  const [wordCount, setWordCount] = useState(15);
  const [targetText, setTargetText] = useState(() => generateRandomWords(15));

  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-focus input on mount or target change
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [targetText, focusInput]);

  // Timer interval while typing
  useEffect(() => {
    if (startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        const seconds = (Date.now() - startTime) / 1000;
        setElapsedTime(seconds);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isFinished]);

  // Reset current game
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setUserInput("");
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(focusInput, 50);
  }, [focusInput]);

  // Generate brand new random word sequence
  const nextRandomWords = useCallback((count = wordCount) => {
    setTargetText(generateRandomWords(count));
    resetGame();
  }, [wordCount, resetGame]);

  // Change word count mode
  const handleSelectWordCount = (count) => {
    setWordCount(count);
    nextRandomWords(count);
  };

  // Handle typing input
  const handleInputChange = (e) => {
    if (isFinished) return;

    const val = e.target.value;
    const now = Date.now();

    // Start timer on first keystroke
    if (!startTime && val.length > 0) {
      setStartTime(now);
    }

    setUserInput(val);

    // Calculate accuracy
    let correctCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correctCount++;
    }
    const currentAcc = val.length > 0 ? Math.round((correctCount / val.length) * 100) : 100;
    setAccuracy(currentAcc);

    // Calculate real-time WPM: (correct characters / 5) / (minutes)
    const activeSeconds = Math.max(1, (now - (startTime || now)) / 1000);
    const wordsTyped = correctCount / 5;
    const currentWpm = Math.round((wordsTyped / activeSeconds) * 60);
    setWpm(currentWpm);

    // Finished condition
    if (val.length >= targetText.length) {
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Rank evaluation based on WPM
  const getRank = (score) => {
    if (score >= 75) return { title: "Lightning Panda", badge: "⚡", color: "text-amber-500", desc: "Elite keyboard speed and precision!" };
    if (score >= 50) return { title: "Bamboo Sprinter", badge: "🎋", color: "text-[#2E6F40]", desc: "Swift, smooth and rhythmic flow." };
    if (score >= 30) return { title: "Steady Scholar", badge: "📚", color: "text-emerald-600", desc: "Deliberate and continuous pace." };
    return { title: "Sleepy Panda", badge: "🐼", color: "text-slate-600", desc: "Taking it easy under the bamboo canopy." };
  };

  const finalRank = getRank(wpm);

  return (
    <div className="min-h-screen bg-[#f3fbf6] text-[#253D2C] flex flex-col justify-between selection:bg-[#CFFFDC] selection:text-[#253D2C]">
      
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <EduvaLogo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <div>
            <span className="text-base font-black tracking-tight text-[#253D2C] leading-none block">
              Eduva
            </span>
            <span className="text-[10px] text-[#2E6F40] font-semibold leading-none">
              Academic Progress Tracker
            </span>
          </div>
        </Link>

        <button
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#c9ebd6] text-xs font-bold text-[#253D2C] hover:bg-[#e3f5eb] transition shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-[#2E6F40]" strokeWidth={2.2} />
          <span>{user ? "Back to Dashboard" : "Return Home"}</span>
        </button>
      </header>

      {/* ── Main Content Container ────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-4 w-full flex flex-col items-center text-center">
        
        {/* ── Cute Sleeping Panda on Bamboo SVG Illustration ───────── */}
        <div className="relative w-full max-w-md h-56 sm:h-64 flex items-center justify-center mb-2">
          
          {/* Animated Zzz floating from sleepy panda */}
          <div className="absolute top-6 right-20 pointer-events-none select-none z-10 flex flex-col items-start gap-1">
            <span className="text-sm font-bold text-[#2E6F40]/70 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "2.4s" }}>Z</span>
            <span className="text-base font-extrabold text-[#2E6F40]/85 animate-bounce ml-3" style={{ animationDelay: "400ms", animationDuration: "2.2s" }}>z</span>
            <span className="text-xl font-black text-[#253D2C] animate-bounce ml-6" style={{ animationDelay: "800ms", animationDuration: "2s" }}>z</span>
          </div>

          <svg
            viewBox="0 0 460 260"
            className="w-full h-full drop-shadow-md select-none overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Soft Glow */}
            <circle cx="230" cy="130" r="100" fill="#CFFFDC" fillOpacity="0.4" />

            {/* ── Background Vertical Bamboo Stalks ── */}
            <g opacity="0.6">
              {/* Far Left Stalk */}
              <rect x="50" y="10" width="14" height="240" rx="4" fill="#68BA7F" />
              <line x1="50" y1="70" x2="64" y2="70" stroke="#255d34" strokeWidth="2.5" />
              <line x1="50" y1="140" x2="64" y2="140" stroke="#255d34" strokeWidth="2.5" />
              <line x1="50" y1="210" x2="64" y2="210" stroke="#255d34" strokeWidth="2.5" />
              
              {/* Leaves Left */}
              <path d="M50 70 C30 50, 15 65, 10 80 C25 80, 45 76, 50 70 Z" fill="#499e63" />
              <path d="M50 70 C35 60, 20 50, 18 35 C32 42, 45 56, 50 70 Z" fill="#68BA7F" />

              {/* Far Right Stalk */}
              <rect x="390" y="10" width="14" height="240" rx="4" fill="#68BA7F" />
              <line x1="390" y1="80" x2="404" y2="80" stroke="#255d34" strokeWidth="2.5" />
              <line x1="390" y1="160" x2="404" y2="160" stroke="#255d34" strokeWidth="2.5" />
              
              {/* Leaves Right */}
              <path d="M404 80 C425 60, 440 75, 445 90 C430 90, 410 86, 404 80 Z" fill="#499e63" />
            </g>

            {/* ── Main Tilted Sleeping Bamboo Trunk/Branch ── */}
            <g>
              {/* Main heavy horizontal bamboo branch */}
              <path
                d="M 20 150 Q 230 160 440 145"
                stroke="#35834c"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 20 148 Q 230 158 440 143"
                stroke="#499e63"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Light bamboo highlight stripe */}
              <path
                d="M 25 142 Q 230 152 435 137"
                stroke="#93e6ad"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Bamboo Segment Rings / Nodes */}
              <line x1="110" y1="138" x2="114" y2="166" stroke="#1b2e21" strokeWidth="3" strokeLinecap="round" />
              <line x1="210" y1="143" x2="214" y2="171" stroke="#1b2e21" strokeWidth="3" strokeLinecap="round" />
              <line x1="320" y1="140" x2="324" y2="168" stroke="#1b2e21" strokeWidth="3" strokeLinecap="round" />

              {/* Sprouting Tender Leaves on branch */}
              <path d="M 330 145 C 360 120, 390 125, 410 115 C 385 135, 355 145, 330 145 Z" fill="#68BA7F" />
              <path d="M 324 147 C 350 155, 375 170, 395 190 C 370 175, 345 160, 324 147 Z" fill="#499e63" />
            </g>

            {/* ── Cute Sleeping Panda ── */}
            {/* Panda Shadow */}
            <ellipse cx="230" cy="148" rx="70" ry="12" fill="#192a1e" fillOpacity="0.18" />

            {/* Back Legs Dangling down */}
            <g>
              {/* Rear Leg Dangling */}
              <rect x="270" y="142" width="22" height="42" rx="11" fill="#253D2C" />
              <circle cx="281" cy="180" r="8" fill="#1b2e21" />
              {/* Front Leg Dangling */}
              <rect x="250" y="145" width="22" height="44" rx="11" fill="#192a1e" />
              <circle cx="261" cy="184" r="8" fill="#101c13" />
              {/* Cute little paws pads */}
              <ellipse cx="261" cy="185" rx="5" ry="4" fill="#477e57" fillOpacity="0.4" />
            </g>

            {/* Panda Plump Chubby Body (Sprawled flat) */}
            <ellipse cx="225" cy="130" rx="56" ry="36" fill="#FFFFFF" />
            
            {/* Panda Black Back Saddle / Patch */}
            <path
              d="M 185 110 C 205 102, 245 102, 265 110 C 275 125, 270 145, 255 148 C 235 152, 200 152, 185 145 C 175 130, 178 118, 185 110 Z"
              fill="#253D2C"
            />

            {/* Front Arm Sprawled & Drooping over branch */}
            <g>
              <rect x="165" y="132" width="20" height="42" rx="10" transform="rotate(18 165 132)" fill="#192a1e" />
              <circle cx="160" cy="172" r="7.5" fill="#101c13" />
            </g>

            {/* Panda Head resting peacefully on the bamboo branch */}
            <g>
              {/* Head Base */}
              <circle cx="145" cy="120" r="32" fill="#FFFFFF" />
              
              {/* Left & Right Ears */}
              <circle cx="120" cy="95" r="12" fill="#253D2C" />
              <circle cx="121" cy="96" r="6" fill="#376344" />
              <circle cx="162" cy="93" r="12" fill="#253D2C" />
              <circle cx="161" cy="94" r="6" fill="#376344" />

              {/* Black Eye Patches (Drooping peacefully) */}
              <ellipse cx="132" cy="122" rx="10" ry="12" transform="rotate(18 132 122)" fill="#253D2C" />
              <ellipse cx="156" cy="120" rx="10" ry="12" transform="rotate(-18 156 120)" fill="#253D2C" />

              {/* Sleeping Eyes (Happy Curved Arcs ◡ ◡) */}
              <path d="M 127 122 Q 132 127 137 122" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 151 120 Q 156 125 161 120" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

              {/* Sweet Cheerful Pink Blush */}
              <circle cx="124" cy="130" r="5" fill="#fca5a5" fillOpacity="0.6" />
              <circle cx="164" cy="128" r="5" fill="#fca5a5" fillOpacity="0.6" />

              {/* Cute Little Nose */}
              <ellipse cx="143" cy="130" rx="5" ry="3.5" fill="#253D2C" />
              {/* Content Mouth Smile */}
              <path d="M 140 134 Q 143 137 146 134" stroke="#253D2C" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Cute Little Tail */}
            <circle cx="280" cy="125" r="7" fill="#253D2C" />
          </svg>
        </div>

        {/* ── 404 Heading & Subtext ─────────────────────────────────── */}
        <div className="mb-5 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFFFDC] text-[#2E6F40] text-xs font-black tracking-wider uppercase mb-1">
            404 Error · Page Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#253D2C] tracking-tight">
            Lost in the Bamboo Grove?
          </h1>
          <p className="text-xs sm:text-sm text-[#477e57] max-w-lg mx-auto">
            This sleepy panda climbed up here to take a rest. Test your typing speed with randomized words before heading back!
          </p>
        </div>

        {/* ── Mini Typing Speed Checker Game Card ───────────────────── */}
        <div
          onClick={focusInput}
          className="w-full max-w-2xl bg-white rounded-2xl border border-[#c9ebd6] p-5 sm:p-6 shadow-md transition-all hover:shadow-lg cursor-text relative text-left"
        >
          {/* Header Bar of Game */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e3f5eb] mb-4">
            
            {/* Mode & Word Count Selector (Monkeytype Style) */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#253D2C] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#2E6F40]" />
                <span>Random Words</span>
              </span>
              
              <div className="flex items-center gap-1 ml-2 bg-[#f3fbf6] p-0.5 rounded-lg border border-[#c9ebd6]">
                {WORD_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectWordCount(count);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      wordCount === count
                        ? "bg-[#2E6F40] text-white shadow-xs"
                        : "text-[#477e57] hover:text-[#253D2C]"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Stats Pill Badges */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-[#f3fbf6] border border-[#c9ebd6] flex items-center gap-1.5 text-xs font-bold text-[#253D2C]">
                <Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.2} />
                <span>{wpm} WPM</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#f3fbf6] border border-[#c9ebd6] flex items-center gap-1.5 text-xs font-bold text-[#253D2C]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6F40]" strokeWidth={2.2} />
                <span>{accuracy}% ACC</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#f3fbf6] border border-[#c9ebd6] text-xs font-mono font-bold text-[#376344]">
                {elapsedTime.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Interactive Randomized Words Display */}
          <div className="min-h-[70px] text-base sm:text-lg font-medium leading-relaxed tracking-wide select-none p-3.5 rounded-xl bg-[#f8fdfa] border border-[#e3f5eb]/80 mb-4 font-mono">
            {targetText.split("").map((char, index) => {
              let charStyle = "text-slate-400";
              const isCurrent = index === userInput.length;

              if (index < userInput.length) {
                if (userInput[index] === char) {
                  charStyle = "text-[#2E6F40] bg-[#CFFFDC]/70 font-semibold";
                } else {
                  charStyle = "text-red-600 bg-red-100 font-semibold underline decoration-red-500";
                }
              }

              return (
                <span
                  key={index}
                  className={`transition-colors rounded-xs ${charStyle} ${
                    isCurrent ? "border-b-2 border-[#2E6F40] bg-[#2E6F40]/15 animate-pulse" : ""
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Typing Input */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            placeholder={startTime ? "Keep typing..." : "Click here or start typing to begin..."}
            className="w-full px-4 py-2.5 rounded-xl border border-[#c9ebd6] focus:border-[#2E6F40] focus:ring-2 focus:ring-[#CFFFDC] outline-none text-sm font-medium transition text-[#253D2C] placeholder:text-slate-400 bg-white"
          />

          {/* ── Finished Celebration Modal Overlay ── */}
          {isFinished && (
            <div className="mt-4 p-4 rounded-xl bg-[#CFFFDC]/40 border border-[#68BA7F]/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-white shadow-xs">{finalRank.badge}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#253D2C]">{finalRank.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#2E6F40] text-white font-bold">
                      {wpm} WPM
                    </span>
                  </div>
                  <p className="text-xs text-[#376344] mt-0.5">
                    {accuracy}% accuracy in {elapsedTime.toFixed(1)} seconds. {finalRank.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={resetGame}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#c9ebd6] text-xs font-bold text-[#253D2C] transition shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => nextRandomWords()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#253D2C] text-white text-xs font-bold transition shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>New Words</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Controls Bar */}
          {!isFinished && (
            <div className="mt-3 flex items-center justify-between text-xs text-[#68BA7F]">
              <span>💡 Press keys to type the randomized string above</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-1 hover:text-[#253D2C] transition font-semibold"
                  title="Reset test"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <span>·</span>
                <button
                  onClick={() => nextRandomWords()}
                  className="flex items-center gap-1 hover:text-[#253D2C] transition font-semibold"
                  title="Generate new words"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>New Words</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Back to App CTA ──────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(user ? "/dashboard" : "/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E6F40] hover:bg-[#253D2C] text-white text-xs font-bold transition shadow-sm"
          >
            <span>{user ? "Resume Studying on Dashboard" : "Back to Home"}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-[#68BA7F]">
        <span>Eduva Academic Progress Tracker · Keep calm and stay focused 🎋</span>
      </footer>

    </div>
  );
}
