import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

const sendAuthResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    completedDates: user.completedDates || [],
    totalStudyMinutes: user.totalStudyMinutes || 0,
    completedGoalsCount: user.completedGoalsCount || 0,
    createdAt: user.createdAt,
    token: signToken(user._id),
  });
};

// @desc  Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6+ characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    sendAuthResponse(user, 201, res);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  // Re-fetch to include all fields (req.user from protect middleware may be lean)
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedDates: user.completedDates || [],
      totalStudyMinutes: user.totalStudyMinutes || 0,
      completedGoalsCount: user.completedGoalsCount || 0,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update name and/or password
// @route PATCH /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be 6+ characters" });
      }
      user.password = newPassword; // pre-save hook will bcrypt it
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedDates: user.completedDates || [],
      totalStudyMinutes: user.totalStudyMinutes || 0,
      completedGoalsCount: user.completedGoalsCount || 0,
      createdAt: user.createdAt,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete account + all associated data
// @route DELETE /api/auth/delete-account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all goals and sections belonging to this user
    const { default: Goal } = await import("../models/Goal.js");
    const { default: Section } = await import("../models/Section.js");

    await Promise.all([
      Goal.deleteMany({ user: userId }),
      Section.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
