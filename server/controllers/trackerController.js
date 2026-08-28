import Section from "../models/Section.js";
import Goal from "../models/Goal.js";

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
export const toggleGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        goal.completed = !goal.completed;
        goal.completedAt = goal.completed ? new Date() : null;
        await goal.save();
        res.status(200).json(goal);
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
