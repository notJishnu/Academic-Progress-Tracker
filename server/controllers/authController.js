import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper: sign token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

// Helper: send consistent response shape
const sendAuthResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    token: signToken(user._id),
  });
};

// @desc  Register user
// @route POST /api/auth/register
export const register = async (req, res, next) => {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // password is select:false → must explicitly request it
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me (protected)
export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};
