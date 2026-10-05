import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  Award,
  Trophy,
  Settings,
  Flame,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { key: "subjects",    icon: BookOpen,        label: "My Subjects" },
  { key: "timer",       icon: Timer,           label: "Focus Timer" },
  { key: "milestones",  icon: Award,           label: "Milestones" },
  { key: "leaderboard", icon: Trophy,          label: "Leaderboard" },
  { key: "settings",    icon: Settings,        label: "Settings" },
];

export default function Sidebar({
  activePage,
  onNavigate,
  timerRunning = false,
}) {
  const { user, logout } = useAuth();
  const dockRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    // Only apply hover physics if the device supports hover
    if (window.matchMedia("(hover: none)").matches) return;

    const maxScale = 1.32;
    const baseDistance = 90;
    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const mouseX = e.clientX;
        itemRefs.current.forEach((item) => {
          if (!item) return;
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(mouseX - itemCenter);

          if (distance < baseDistance) {
            const normDist = distance / baseDistance;
            const scale = 1 + (maxScale - 1) * Math.cos((normDist * Math.PI) / 2);
            const translateY = -((scale - 1) * 14);
            item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
          } else {
            item.style.transform = "scale(1) translateY(0px)";
          }
        });
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      itemRefs.current.forEach((item) => {
        if (!item) return;
        item.style.transform = "scale(1) translateY(0px)";
      });
    };

    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-0 right-0 pointer-events-none z-40 flex justify-center px-3">
      <nav
        ref={dockRef}
        aria-label="Navigation Dock"
        className="pointer-events-auto flex items-end gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-2xl bg-[#253D2C]/90 backdrop-blur-xl border border-[#68BA7F]/35 shadow-2xl shadow-[#101c13]/50 overflow-visible select-none"
      >
        {NAV_ITEMS.map((item, idx) => {
          const active = activePage === item.key;
          const Icon = item.icon;
          const isTimer = item.key === "timer";

          return (
            <div
              key={item.key}
              ref={(el) => (itemRefs.current[idx] = el)}
              style={{
                transformOrigin: "bottom center",
                transition: "transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)",
                willChange: "transform",
              }}
              className="relative group flex flex-col items-center flex-shrink-0"
            >
              {/* Tooltip (pointer-events-none to never block clicks or placeholder text) */}
              <div className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#192a1e] text-[#CFFFDC] text-xs font-semibold whitespace-nowrap shadow-md border border-[#68BA7F]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                {item.label}
              </div>

              <button
                onClick={() => onNavigate(item.key)}
                className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-colors duration-150 ${
                  active
                    ? "bg-[#2E6F40] text-[#CFFFDC] shadow-sm"
                    : "bg-transparent text-[#68BA7F] hover:bg-[#2E6F40]/50 hover:text-[#CFFFDC]"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.2} />

                {/* Active Indicator Dot */}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CFFFDC] absolute -bottom-1 shadow-xs" />
                )}

                {/* Pulse badge if timer is actively running */}
                {isTimer && timerRunning && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#68BA7F] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#68BA7F]" />
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-6 bg-[#68BA7F]/30 mx-1 self-center rounded-full flex-shrink-0" />

        {/* Streak chip */}
        <div
          ref={(el) => (itemRefs.current[NAV_ITEMS.length] = el)}
          style={{
            transformOrigin: "bottom center",
            transition: "transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)",
            willChange: "transform",
          }}
          className="relative group flex flex-col items-center flex-shrink-0"
        >
          <div className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#192a1e] text-[#CFFFDC] text-xs font-semibold whitespace-nowrap shadow-md border border-[#68BA7F]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
            {user?.currentStreak ?? 0} Day Streak 🔥
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#2E6F40]/30 border border-[#68BA7F]/25 text-amber-400">
            <Flame className="w-5 h-5" strokeWidth={2.2} />
          </div>
        </div>

        {/* Logout item */}
        <div
          ref={(el) => (itemRefs.current[NAV_ITEMS.length + 1] = el)}
          style={{
            transformOrigin: "bottom center",
            transition: "transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)",
            willChange: "transform",
          }}
          className="relative group flex flex-col items-center flex-shrink-0"
        >
          <div className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#192a1e] text-red-200 text-xs font-semibold whitespace-nowrap shadow-md border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
            Log Out
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-transparent text-[#68BA7F] hover:bg-red-950/40 hover:text-red-300 transition-colors duration-150"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>
      </nav>
    </div>
  );
}
