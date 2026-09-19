import Section from "../models/Section.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";

const toDayStr = (d) => new Date(d).toISOString().slice(0, 10);
const isYesterday = (dateStr) => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return toDayStr(y) === dateStr;
};


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
// @desc  Toggle goal complete + update study streak
// @route PATCH /api/tracker/goals/:id/toggle
export const toggleGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;
    await goal.save();

    // --- Streak logic (only when completing, not un-completing) ---
    if (goal.completed) {
      const user = await User.findById(req.user._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const last = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
      if (last) last.setHours(0, 0, 0, 0);

      if (!last || last < yesterday) {
        // Missed a day (or first ever) → reset to 1
        user.currentStreak = 1;
      } else if (last.getTime() === yesterday.getTime()) {
        // Consecutive day → increment
        user.currentStreak += 1;
      }
      // else: already counted today → no change

      if (last === null || last.getTime() !== today.getTime()) {
        user.lastStreakDate = today;
      }

      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      await user.save();
    }

    res.json(goal);
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
