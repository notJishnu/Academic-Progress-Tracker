import { useState, useEffect } from "react";
import {
  X,
  Flame,
  Clock,
  Target,
  Award,
  Calendar,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { getUserProfile } from "../lib/tracker";

export default function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getUserProfile(userId);
        if (isMounted) {
          setProfile(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load user profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [userId, onClose]);

  if (!userId) return null;

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : "?";
  const joinedFormatted = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent Scholar";

  // Tier color styling for badges
  const getTierBadge = (tier) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "gold":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "silver":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-[#c9ebd6] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-slate-100 border border-[#c9ebd6] flex items-center justify-center text-[#477e57] hover:text-[#253D2C] transition shadow-xs cursor-pointer"
          title="Close profile"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#c9ebd6] border-t-[#2E6F40] rounded-full animate-spin" />
            <p className="text-xs font-bold text-[#477e57]">Loading scholar profile…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h3 className="text-base font-bold text-[#253D2C]">Unable to Load Profile</h3>
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2E6F40] text-white rounded-xl text-xs font-bold hover:bg-[#253D2C] transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 sm:p-7 space-y-6">
            
            {/* ── Profile Top Hero ────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b border-[#e3f5eb]">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#253D2C] to-[#2E6F40] text-[#CFFFDC] font-black text-3xl flex items-center justify-center shadow-md">
                  {initial}
                </div>
                {profile.rank && profile.rank <= 3 && (
                  <span className="absolute -bottom-2 -right-2 text-xl drop-shadow-sm">
                    {profile.rank === 1 ? "👑" : profile.rank === 2 ? "🥈" : "🥉"}
                  </span>
                )}
              </div>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-black text-[#253D2C] truncate">
                    {profile.name}
                  </h2>
                  {profile.isCurrentUser && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2E6F40] text-white text-[10px] font-bold uppercase tracking-wider">
                      You
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#CFFFDC] text-[#2E6F40] text-[11px] font-black">
                    Rank #{profile.rank}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-[#477e57] font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {joinedFormatted}</span>
                  </span>
                  <span>·</span>
                  <span>Top {Math.max(1, Math.round((profile.rank / (profile.totalParticipants || 1)) * 100))}% of scholars</span>
                </div>
              </div>
            </div>

            {/* ── Key Academic Stats Grid ──────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Hours */}
              <div className="bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl p-3.5 text-center">
                <div className="w-7 h-7 rounded-lg bg-[#CFFFDC] text-[#2E6F40] flex items-center justify-center mx-auto mb-1.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-lg font-black font-mono text-[#2E6F40]">
                  {profile.totalHours} hrs
                </div>
                <div className="text-[10px] uppercase font-bold text-[#477e57]">
                  Total Focused
                </div>
              </div>

              {/* Current Streak */}
              <div className="bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl p-3.5 text-center">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-[#253D2C]">
                  {profile.currentStreak}d
                </div>
                <div className="text-[10px] uppercase font-bold text-[#477e57]" title={`Longest: ${profile.longestStreak} days`}>
                  Streak ({profile.longestStreak}d max)
                </div>
              </div>

              {/* Goals Completed */}
              <div className="bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl p-3.5 text-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-[#253D2C]">
                  {profile.completedGoalsCount}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#477e57]">
                  Goals Completed
                </div>
              </div>

              {/* Badges Unlocked */}
              <div className="bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl p-3.5 text-center">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-[#253D2C]">
                  {profile.badges?.length || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#477e57]">
                  Badges Earned
                </div>
              </div>
            </div>

            {/* ── Study Focus Areas (Sections) ─────────────────── */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2E6F40]" />
                <h3 className="text-xs font-bold text-[#253D2C] uppercase tracking-wider">
                  Active Study Subjects ({profile.sections?.length || 0})
                </h3>
              </div>

              {profile.sections && profile.sections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.sections.map((sec) => (
                    <div
                      key={sec._id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#c9ebd6] shadow-2xs text-xs font-semibold text-[#253D2C]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sec.color || "#2E6F40" }}
                      />
                      <span>{sec.name}</span>
                      {sec.targetHours > 0 && (
                        <span className="text-[10px] text-[#477e57] font-mono">
                          ({sec.targetHours}h target)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#68BA7F] italic bg-[#f8fdfa] p-3 rounded-xl border border-[#e3f5eb]">
                  No specific subject categories created yet.
                </p>
              )}
            </div>

            {/* ── Badges Showcase ──────────────────────────────── */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#2E6F40]" />
                <h3 className="text-xs font-bold text-[#253D2C] uppercase tracking-wider">
                  Milestone Badges ({profile.badges?.length || 0})
                </h3>
              </div>

              {profile.badges && profile.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profile.badges.map((b) => (
                    <div
                      key={b.id || b.name}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#c9ebd6] shadow-2xs"
                    >
                      <div className="text-2xl p-1.5 rounded-lg bg-[#f3fbf6] border border-[#c9ebd6] shrink-0">
                        {b.icon || "🎖️"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#253D2C] truncate">{b.name}</p>
                          {b.tier && (
                            <span
                              className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded border ${getTierBadge(
                                b.tier
                              )}`}
                            >
                              {b.tier}
                            </span>
                          )}
                        </div>
                        {b.description && (
                          <p className="text-[11px] text-[#477e57] truncate mt-0.5">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#68BA7F] italic bg-[#f8fdfa] p-3 rounded-xl border border-[#e3f5eb]">
                  No milestone badges unlocked yet. Keep focusing to unlock achievements!
                </p>
              )}
            </div>

            {/* ── Recent Activity / Study Consistency ─────────── */}
            {profile.dailyLogs && profile.dailyLogs.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#e3f5eb]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2E6F40]" />
                    <h3 className="text-xs font-bold text-[#253D2C] uppercase tracking-wider">
                      Recent Activity Consistency
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#477e57] font-semibold">
                    Last {profile.dailyLogs.length} active sessions
                  </span>
                </div>

                <div className="flex items-end gap-1.5 h-16 bg-[#f8fdfa] border border-[#e3f5eb] rounded-2xl p-3 overflow-x-auto">
                  {profile.dailyLogs.slice(-14).map((log, idx) => {
                    const maxMins = 180;
                    const heightPct = Math.min(100, Math.max(15, Math.round((log.minutes / maxMins) * 100)));
                    return (
                      <div
                        key={idx}
                        className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative cursor-pointer"
                      >
                        <div
                          className="w-full bg-[#2E6F40] rounded-t-sm transition-all group-hover:bg-[#253D2C]"
                          style={{ height: `${heightPct}%` }}
                        />
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-7 bg-[#253D2C] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                          {log.date}: {log.minutes}m
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-[#f8fdfa] border-t border-[#e3f5eb] flex items-center justify-between text-xs text-[#477e57]">
          <span>Eduva Scholar Profile</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#c9ebd6] hover:bg-slate-50 text-[#253D2C] font-bold transition shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
