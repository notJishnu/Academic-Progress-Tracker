import Section from "../models/Section.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { BADGES } from "../config/badgeConfig.js";

const toDayStr = (d) => new Date(d).toISOString().slice(0, 10);

function checkAndAwardBadges(user) {
  const existingBadgeIds = new Set((user.badges || []).map((b) => b.id));
  const newlyAwarded = [];

  for (const badge of BADGES) {
    if (existingBadgeIds.has(badge.id)) continue;

    let unlocked = false;
    if (badge.type === "goals_completed" && (user.completedGoalsCount || 0) >= badge.threshold) {
      unlocked = true;
    } else if (badge.type === "streak" && (user.currentStreak || 0) >= badge.threshold) {
      unlocked = true;
    } else if (badge.type === "minutes" && (user.totalStudyMinutes || 0) >= badge.threshold) {
      unlocked = true;
    }

    if (unlocked) {
      const awardedBadge = {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
        unlockedAt: new Date(),
      };
      user.badges.push(awardedBadge);
      newlyAwarded.push(awardedBadge);
    }
  }

  return newlyAwarded;
}

// ---------- SECTIONS ----------

// GET /api/sections
export const getSections = async (req, res) => {
  try {
    const sections = await Section.find({ user: req.user._id }).sort("createdAt");
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sections
export const createSection = async (req, res) => {
  try {
    const { name, color, targetHours } = req.body;
    if (!name) return res.status(400).json({ message: "Section name is required" });
    const target = Math.max(1, Number(targetHours) || 20);
    const section = await Section.create({ user: req.user._id, name, color, targetHours: target });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sections/:id
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!section) return res.status(404).json({ message: "Section not found" });
    await Goal.deleteMany({ section: req.params.id, user: req.user._id });
    res.status(200).json({ message: "Section and its goals deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- GOALS ----------

// GET /api/goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .populate("section", "name color")
      .sort("-createdAt");
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/goals
export const createGoal = async (req, res) => {
  try {
    const { section, title, plannedMinutes } = req.body;
    if (!section || !title || !plannedMinutes) {
      return res.status(400).json({ message: "Section, title and planned minutes are required" });
    }
    if (plannedMinutes < 5) {
      return res.status(400).json({ message: "Minimum 5 minutes required" });
    }
    const owns = await Section.findOne({ _id: section, user: req.user._id });
    if (!owns) return res.status(400).json({ message: "Invalid section" });

    const goal = await Goal.create({ user: req.user._id, section, title, plannedMinutes });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/goals/:id/toggle
// @desc  Toggle goal complete + update study streak, daily minutes, and milestone badges
// @route PATCH /api/tracker/goals/:id/toggle
export const toggleGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;

    if (goal.completed && req.body?.actualMinutes && Number(req.body.actualMinutes) > 0) {
      goal.actualMinutes = Number(req.body.actualMinutes);
    } else if (!goal.completed) {
      goal.actualMinutes = undefined;
    }

    await goal.save();

    const user = await User.findById(req.user._id);
    let newBadges = [];

    if (user) {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      if (!user.completedDates) user.completedDates = [];
      if (!user.dailyLogs) user.dailyLogs = [];

      let logEntry = user.dailyLogs.find((l) => l.date === todayKey);
      if (!logEntry) {
        logEntry = { date: todayKey, minutes: 0 };
        user.dailyLogs.push(logEntry);
      }

      const minutesToRecord = goal.actualMinutes || goal.plannedMinutes || 0;

      if (goal.completed) {
        // Increment completed goals and study minutes
        user.completedGoalsCount = (user.completedGoalsCount || 0) + 1;
        user.totalStudyMinutes = (user.totalStudyMinutes || 0) + minutesToRecord;
        logEntry.minutes += minutesToRecord;

        if (!user.completedDates.includes(todayKey)) {
          user.completedDates.push(todayKey);
          if (user.completedDates.length > 400) {
            user.completedDates = user.completedDates.slice(-400);
          }
        }

        // Streak calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const last = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
        if (last) last.setHours(0, 0, 0, 0);

        if (!last || last < yesterday) {
          user.currentStreak = 1;
        } else if (last.getTime() === yesterday.getTime()) {
          user.currentStreak += 1;
        }

        if (last === null || last.getTime() !== today.getTime()) {
          user.lastStreakDate = today;
        }

        user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);

        // Check and award badges
        newBadges = checkAndAwardBadges(user);
      } else {
        // Un-completing goal
        user.completedGoalsCount = Math.max(0, (user.completedGoalsCount || 1) - 1);
        user.totalStudyMinutes = Math.max(0, (user.totalStudyMinutes || minutesToRecord) - minutesToRecord);
        logEntry.minutes = Math.max(0, logEntry.minutes - minutesToRecord);
      }

      await user.save();
    }

    res.json({
      goal,
      newBadges,
      userStats: user ? {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalStudyMinutes: user.totalStudyMinutes,
        completedGoalsCount: user.completedGoalsCount,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- BADGES ----------

// GET /api/tracker/badges
export const getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const unlockedMap = new Map((user?.badges || []).map((b) => [b.id, b]));

    const result = BADGES.map((b) => {
      const unlocked = unlockedMap.has(b.id);
      let progress = 0;
      const target = b.threshold;

      if (b.type === "goals_completed") {
        progress = Math.min(target, user?.completedGoalsCount || 0);
      } else if (b.type === "streak") {
        progress = Math.min(target, user?.currentStreak || 0);
      } else if (b.type === "minutes") {
        progress = Math.min(target, user?.totalStudyMinutes || 0);
      }

      return {
        ...b,
        unlocked,
        unlockedAt: unlocked ? unlockedMap.get(b.id).unlockedAt : null,
        progress,
        target,
        pct: Math.min(100, Math.round((progress / target) * 100)),
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- FOCUS TIMER SESSIONS ----------

// POST /api/tracker/session
export const logSession = async (req, res) => {
  try {
    const { sectionId, goalId, title } = req.body;
    const minutes = Math.max(1, Number(req.body.minutes) || 1);

    let targetSectionId = sectionId;
    let goal = null;

    // 1. If goalId provided, find and complete that specific goal
    if (goalId) {
      goal = await Goal.findOne({ _id: goalId, user: req.user._id });
      if (goal) {
        goal.actualMinutes = (goal.actualMinutes || 0) + minutes;
        const reached = goal.actualMinutes >= goal.plannedMinutes;
        goal.completed = reached;
        goal.completedAt = reached ? new Date() : null;
        targetSectionId = goal.section;
        await goal.save();
      }
    }

    // 2. If no goal completed yet, find an uncompleted goal in target section or create a completed goal
    if (!goal) {
      if (!targetSectionId) {
        let firstSec = await Section.findOne({ user: req.user._id });
        if (!firstSec) {
          firstSec = await Section.create({
            user: req.user._id,
            name: "General Study",
            color: "#2E6F40",
          });
        }
        targetSectionId = firstSec._id;
      }

      const activeGoal = await Goal.findOne({
        user: req.user._id,
        section: targetSectionId,
        completed: false,
      });

      if (activeGoal) {
        activeGoal.actualMinutes = (activeGoal.actualMinutes || 0) + minutes;
        const reached = activeGoal.actualMinutes >= activeGoal.plannedMinutes;
        activeGoal.completed = reached;
        activeGoal.completedAt = reached ? new Date() : null;
        await activeGoal.save();
        goal = activeGoal;
      } else {
        const sec = await Section.findById(targetSectionId);
        const goalTitle = title || `Focus Session (${sec ? sec.name : "Study"})`;
        goal = await Goal.create({
          user: req.user._id,
          section: targetSectionId,
          title: goalTitle,
          plannedMinutes: minutes,
          actualMinutes: minutes,
          completed: true,
          completedAt: new Date(),
        });
      }
    }

    // 3. Update User stats, streaks, and award badges
    const user = await User.findById(req.user._id);
    let newBadges = [];

    if (user) {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      if (!user.completedDates) user.completedDates = [];
      if (!user.dailyLogs) user.dailyLogs = [];

      let logEntry = user.dailyLogs.find((l) => l.date === todayKey);
      if (!logEntry) {
        logEntry = { date: todayKey, minutes: 0 };
        user.dailyLogs.push(logEntry);
      }

      if (goal && goal.completed) {
        user.completedGoalsCount = (user.completedGoalsCount || 0) + 1;
      }
      user.totalStudyMinutes = (user.totalStudyMinutes || 0) + minutes;
      logEntry.minutes += minutes;

      if (!user.completedDates.includes(todayKey)) {
        user.completedDates.push(todayKey);
        if (user.completedDates.length > 400) {
          user.completedDates = user.completedDates.slice(-400);
        }
      }

      // Streak calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const last = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
      if (last) last.setHours(0, 0, 0, 0);

      if (!last || last < yesterday) {
        user.currentStreak = 1;
      } else if (last.getTime() === yesterday.getTime()) {
        user.currentStreak += 1;
      }

      if (last === null || last.getTime() !== today.getTime()) {
        user.lastStreakDate = today;
      }

      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);

      newBadges = checkAndAwardBadges(user);
      await user.save();
    }

    if (goal) {
      await goal.populate("section", "name color");
    }

    res.status(200).json({
      success: true,
      goal,
      newBadges,
      userStats: user
        ? {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalStudyMinutes: user.totalStudyMinutes,
            completedGoalsCount: user.completedGoalsCount,
          }
        : null,
    });
  } catch (error) {
    console.error("LOG SESSION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------- DAILY SUMMARY & LOGS ----------

// GET /api/tracker/summary
export const getDailySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const goals = await Goal.find({ user: req.user._id }).populate("section", "name color");

    const getDayStr = (d) => {
      if (!d) return "";
      const date = new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const completedToday = goals.filter((g) => {
      if (!g.completed) return false;
      if (!g.completedAt) return false;
      return getDayStr(g.completedAt) === todayKey || toDayStr(g.completedAt) === toDayStr(now);
    });

    const goalsMinutes = completedToday.reduce(
      (acc, g) => acc + (g.actualMinutes || g.plannedMinutes || 0),
      0
    );

    const todayLog = (user?.dailyLogs || []).find((l) => l.date === todayKey);
    const todayMinutes = Math.max(goalsMinutes, todayLog?.minutes || 0);

    const sectionMap = {};
    for (const g of completedToday) {
      const secName = g.section?.name || "General";
      const secColor = g.section?.color || "#2E6F40";
      if (!sectionMap[secName]) {
        sectionMap[secName] = { name: secName, color: secColor, minutes: 0, count: 0 };
      }
      sectionMap[secName].minutes += g.actualMinutes || g.plannedMinutes || 0;
      sectionMap[secName].count += 1;
    }

    const dailyLogsMap = {};
    for (const log of user?.dailyLogs || []) {
      dailyLogsMap[log.date] = (dailyLogsMap[log.date] || 0) + log.minutes;
    }

    res.status(200).json({
      todayDate: todayKey,
      todayMinutes,
      completedTodayCount: completedToday.length,
      sectionBreakdown: Object.values(sectionMap),
      dailyLogs: dailyLogsMap,
      totalStudyMinutes: user?.totalStudyMinutes || 0,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      badgesCount: user?.badges?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- LEADERBOARD ----------

// GET /api/tracker/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name avatar totalStudyMinutes currentStreak badges")
      .sort({ totalStudyMinutes: -1, currentStreak: -1 })
      .limit(50);

    const mappedLeaderboard = users.map((u, index) => ({
      rank: index + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar || null,
      totalStudyMinutes: u.totalStudyMinutes || 0,
      totalHours: Number(((u.totalStudyMinutes || 0) / 60).toFixed(1)),
      currentStreak: u.currentStreak || 0,
      badgesCount: u.badges?.length || 0,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));

    // Find current user rank
    const currentUser = await User.findById(req.user._id).select("name avatar totalStudyMinutes currentStreak badges");
    const currentMins = currentUser?.totalStudyMinutes || 0;
    const higherCount = await User.countDocuments({
      $or: [
        { totalStudyMinutes: { $gt: currentMins } },
        { totalStudyMinutes: currentMins, _id: { $lt: req.user._id } },
      ],
    });
    const userRank = higherCount + 1;
    const totalUsersCount = await User.countDocuments();

    res.status(200).json({
      leaderboard: mappedLeaderboard,
      currentUserRank: {
        rank: userRank,
        name: currentUser?.name || "You",
        avatar: currentUser?.avatar || null,
        totalStudyMinutes: currentMins,
        totalHours: Number((currentMins / 60).toFixed(1)),
        currentStreak: currentUser?.currentStreak || 0,
        badgesCount: currentUser?.badges?.length || 0,
      },
      totalParticipants: totalUsersCount,
    });
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

