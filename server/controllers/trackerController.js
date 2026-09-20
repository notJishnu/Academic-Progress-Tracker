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
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: "Section name is required" });
    const section = await Section.create({ user: req.user._id, name, color });
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

// ---------- DAILY SUMMARY & LOGS ----------

// GET /api/tracker/summary
export const getDailySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const goals = await Goal.find({ user: req.user._id }).populate("section", "name color");

    const completedToday = goals.filter(
      (g) => g.completed && g.completedAt && toDayStr(g.completedAt) === toDayStr(now)
    );

    const todayMinutes = completedToday.reduce(
      (acc, g) => acc + (g.actualMinutes || g.plannedMinutes || 0),
      0
    );

    const sectionMap = {};
    for (const g of completedToday) {
      const secName = g.section?.name || "General";
      const secColor = g.section?.color || "#6366f1";
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
