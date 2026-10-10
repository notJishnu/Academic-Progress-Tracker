import { useState, useEffect } from "react";
import { Search, X, User as UserIcon, ExternalLink } from "lucide-react";
import { getLeaderboard } from "../../lib/tracker";
import UserProfileModal from "../UserProfileModal";

export default function LeaderboardView({ user }) {
  const [data, setData] = useState({
    leaderboard: [],
    currentUserRank: null,
    totalParticipants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch leaderboard whenever debouncedSearch changes
  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getLeaderboard({ search: debouncedSearch });
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load leaderboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const { leaderboard = [], currentUserRank, totalParticipants = 0 } = data;
  const topThree = !debouncedSearch ? leaderboard.slice(0, 3) : [];
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#c9ebd6]">
        <div>
          <h1 className="text-2xl font-black text-[#253D2C] leading-tight flex items-center gap-2.5">
            <span>🏆</span>
            <span>Focus Leaderboard</span>
          </h1>
          <p className="text-xs text-[#477e57] font-medium mt-0.5">
            Recognizing dedicated scholars across the platform based on deep work hours focused.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-[#c9ebd6] px-3.5 py-2 rounded-xl shadow-2xs">
          <span className="text-base">🎓</span>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#68BA7F]">Scholars</p>
            <p className="text-xs font-black text-[#253D2C]">{totalParticipants} Registered</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Top 3 Podium Cards (Shown only when not filtering) ─ */}
      {!debouncedSearch && leaderboard.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
          {/* 2nd Place */}
          {second && (
            <div
              onClick={() => setSelectedUserId(second._id)}
              className="order-2 md:order-1 bg-white rounded-3xl p-5 border border-[#c9ebd6] shadow-xs text-center flex flex-col items-center space-y-3 relative hover:border-[#68BA7F] hover:shadow-md transition cursor-pointer group"
              title="Click to view scholar profile"
            >
              <div className="absolute -top-3.5 bg-slate-100 text-slate-700 border border-slate-300 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
                🥈 2nd Place
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-black text-slate-700 shadow-xs mt-1 transition-transform group-hover:scale-105">
                {second.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-sm text-[#253D2C] truncate max-w-[150px] flex items-center justify-center gap-1">
                  <span>{second.name}</span>
                  {second.isCurrentUser && <span className="text-[10px] text-[#2E6F40] font-bold">(You)</span>}
                </h3>
                <p className="text-xs text-[#68BA7F] font-semibold mt-0.5">
                  🔥 {second.currentStreak} day streak
                </p>
              </div>
              <div className="w-full bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl py-2 px-3">
                <span className="text-lg font-mono font-black text-[#2E6F40] block">
                  {second.totalHours} hrs
                </span>
                <span className="text-[10px] font-bold text-[#477e57] uppercase tracking-wider">
                  Focused
                </span>
              </div>
              <span className="text-[10px] text-[#2E6F40] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> View Profile
              </span>
            </div>
          )}

          {/* 1st Place (Elevated Champion) */}
          {first && (
            <div
              onClick={() => setSelectedUserId(first._id)}
              className="order-1 md:order-2 bg-gradient-to-b from-[#CFFFDC]/40 via-white to-white rounded-3xl p-6 border-2 border-[#2E6F40] shadow-md text-center flex flex-col items-center space-y-3 relative md:-translate-y-2 hover:shadow-xl transition cursor-pointer group"
              title="Click to view champion profile"
            >
              <div className="absolute -top-4 bg-amber-400 text-amber-950 font-black px-4 py-1 rounded-full text-xs shadow-md flex items-center gap-1">
                <span>👑</span>
                <span>1st Champion</span>
              </div>
              <div className="w-20 h-20 rounded-full bg-amber-50 border-3 border-amber-400 flex items-center justify-center text-2xl font-black text-amber-700 shadow-md mt-1 transition-transform group-hover:scale-105">
                {first.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-base text-[#253D2C] truncate max-w-[180px] flex items-center justify-center gap-1">
                  <span>{first.name}</span>
                  {first.isCurrentUser && <span className="text-xs text-[#2E6F40] font-bold">(You)</span>}
                </h3>
                <p className="text-xs text-[#2E6F40] font-bold mt-0.5">
                  🔥 {first.currentStreak} day streak · 🎖️ {first.badgesCount} badges
                </p>
              </div>
              <div className="w-full bg-[#CFFFDC]/60 border border-[#68BA7F] rounded-2xl py-2.5 px-3">
                <span className="text-2xl font-mono font-black text-[#253D2C] block">
                  {first.totalHours} hrs
                </span>
                <span className="text-[10px] font-bold text-[#2E6F40] uppercase tracking-wider">
                  Total Deep Work
                </span>
              </div>
              <span className="text-[10px] text-[#2E6F40] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> View Profile
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div
              onClick={() => setSelectedUserId(third._id)}
              className="order-3 bg-white rounded-3xl p-5 border border-[#c9ebd6] shadow-xs text-center flex flex-col items-center space-y-3 relative hover:border-[#68BA7F] hover:shadow-md transition cursor-pointer group"
              title="Click to view scholar profile"
            >
              <div className="absolute -top-3.5 bg-amber-100 text-amber-800 border border-amber-300 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
                🥉 3rd Place
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-600/40 flex items-center justify-center text-xl font-black text-amber-800 shadow-xs mt-1 transition-transform group-hover:scale-105">
                {third.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-sm text-[#253D2C] truncate max-w-[150px] flex items-center justify-center gap-1">
                  <span>{third.name}</span>
                  {third.isCurrentUser && <span className="text-[10px] text-[#2E6F40] font-bold">(You)</span>}
                </h3>
                <p className="text-xs text-[#68BA7F] font-semibold mt-0.5">
                  🔥 {third.currentStreak} day streak
                </p>
              </div>
              <div className="w-full bg-[#f8fdfa] border border-[#c9ebd6] rounded-2xl py-2 px-3">
                <span className="text-lg font-mono font-black text-[#2E6F40] block">
                  {third.totalHours} hrs
                </span>
                <span className="text-[10px] font-bold text-[#477e57] uppercase tracking-wider">
                  Focused
                </span>
              </div>
              <span className="text-[10px] text-[#2E6F40] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> View Profile
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Your Standing Card (Clickable to view own profile) ─ */}
      {currentUserRank && !debouncedSearch && !loading && (
        <div
          onClick={() => setSelectedUserId(user?._id)}
          className="bg-gradient-to-r from-[#253D2C] to-[#2E6F40] text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition group"
          title="Click to view your public scholar profile"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#CFFFDC] text-[#253D2C] font-black text-xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Your Standing</h3>
                <span className="bg-[#CFFFDC]/20 border border-[#CFFFDC]/30 text-[#CFFFDC] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Active Scholar
                </span>
              </div>
              <p className="text-xs text-[#CFFFDC] mt-0.5">
                Ranked <b className="text-white font-black">#{currentUserRank.rank}</b> among {totalParticipants} students on Eduva.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:border-l sm:border-[#CFFFDC]/20 sm:pl-6 self-start sm:self-auto">
            <div>
              <p className="text-[10px] text-[#CFFFDC] uppercase font-bold tracking-wider">Focused Time</p>
              <p className="text-xl font-black text-white font-mono">{currentUserRank.totalHours} hrs</p>
            </div>
            <div>
              <p className="text-[10px] text-[#CFFFDC] uppercase font-bold tracking-wider">Streak</p>
              <p className="text-xl font-black text-white">🔥 {currentUserRank.currentStreak}d</p>
            </div>
            <div>
              <p className="text-[10px] text-[#CFFFDC] uppercase font-bold tracking-wider">Badges</p>
              <p className="text-xl font-black text-white">🎖️ {currentUserRank.badgesCount}</p>
            </div>
            <div className="hidden md:flex items-center text-xs text-[#CFFFDC] opacity-80 group-hover:opacity-100 transition pl-2">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* ── Complete Leaderboard Table with Search ───────────── */}
      <div className="bg-white rounded-3xl border border-[#c9ebd6] shadow-xs overflow-hidden">
        
        {/* Table Top Controls & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e3f5eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#253D2C]">
              {debouncedSearch ? "Search Results" : "Overall Rankings"}
            </h2>
            <p className="text-xs text-[#477e57]">
              {debouncedSearch
                ? `Showing matching students for "${debouncedSearch}"`
                : "Top 50 students ranked by total focused hours · Click any scholar to view their profile"}
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#477e57]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar by name..."
              className="w-full pl-9 pr-8 py-2 bg-[#f8fdfa] rounded-xl border border-[#c9ebd6] focus:border-[#2E6F40] focus:ring-2 focus:ring-[#CFFFDC] outline-none text-xs font-semibold text-[#253D2C] placeholder:text-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#c9ebd6] border-t-[#2E6F40] rounded-full animate-spin" />
            <p className="text-xs font-bold text-[#477e57]">
              {debouncedSearch ? "Searching scholars…" : "Calculating focus rankings…"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e3f5eb] bg-[#f8fdfa] text-[11px] font-bold text-[#477e57] uppercase tracking-wider">
                  <th className="py-3 px-5 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-center">Badges</th>
                  <th className="py-3 px-5 text-right">Hours Focused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3f5eb] text-xs">
                {leaderboard.map((item) => {
                  const isUser = item.isCurrentUser || item._id === user?._id;
                  const rankMedal =
                    item.rank === 1
                      ? "🥇"
                      : item.rank === 2
                      ? "🥈"
                      : item.rank === 3
                      ? "🥉"
                      : null;

                  return (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedUserId(item._id)}
                      className={`transition cursor-pointer group ${
                        isUser
                          ? "bg-[#CFFFDC]/40 font-bold hover:bg-[#CFFFDC]/70"
                          : "hover:bg-[#f8fdfa]"
                      }`}
                      title="Click to view student profile"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-5 text-center font-mono">
                        {rankMedal ? (
                          <span className="text-base" title={`Rank ${item.rank}`}>{rankMedal}</span>
                        ) : (
                          <span className="font-bold text-[#68BA7F]">#{item.rank}</span>
                        )}
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-transform group-hover:scale-105 ${
                              isUser
                                ? "bg-[#2E6F40] text-white"
                                : "bg-[#e3f5eb] text-[#253D2C]"
                            }`}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#253D2C] truncate flex items-center gap-1.5 group-hover:text-[#2E6F40] transition">
                              <span>{item.name}</span>
                              {isUser && (
                                <span className="bg-[#2E6F40] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-center font-semibold text-[#253D2C]">
                        🔥 {item.currentStreak}d
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 text-center font-semibold text-[#477e57]">
                        🎖️ {item.badgesCount}
                      </td>

                      {/* Hours Focused */}
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#2E6F40] text-sm">
                        {item.totalHours} hrs
                      </td>
                    </tr>
                  );
                })}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[#477e57]">
                      {debouncedSearch ? (
                        <div className="space-y-2">
                          <p className="font-bold text-sm text-[#253D2C]">
                            No scholars found matching &ldquo;{debouncedSearch}&rdquo;
                          </p>
                          <p className="text-xs text-[#68BA7F]">
                            Try checking the spelling or search for another scholar name.
                          </p>
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 px-3 py-1.5 rounded-xl bg-white border border-[#c9ebd6] text-xs font-bold text-[#2E6F40] hover:bg-slate-50 transition"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        "No focus records logged yet. Be the first to start a focus timer!"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Public User Profile Modal ────────────────────────── */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
