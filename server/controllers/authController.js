import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../config/email.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      badges: user.badges || [],
      dailyLogs: user.dailyLogs || [],
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

// @desc  Google OAuth — verify credential from frontend, issue JWT
// @route POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Try to find existing user by googleId first, then by email
    let user = await User.findOne({ googleId });

    if (!user) {
      // If they already have an email account, link it
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (picture) user.avatar = picture;
        await user.save();
      } else {
        // Brand new user via Google
        user = await User.create({ name, email, googleId, avatar: picture });
      }
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// @desc  GitHub OAuth — exchange code for token, fetch profile & email, issue JWT
// @route POST /api/auth/github
export const githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "GitHub authorization code is required" });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        message: "GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env",
      });
    }

    // 1. Exchange temporary authorization code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("GITHUB TOKEN EXCHANGE ERROR:", tokenData);
      return res.status(400).json({
        message: tokenData.error_description || "Failed to exchange GitHub authorization code",
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Eduva-Academic-Tracker",
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      return res.status(401).json({ message: "Failed to fetch GitHub profile" });
    }

    const githubUser = await userResponse.json();
    const githubId = String(githubUser.id);
    const name = githubUser.name || githubUser.login;
    const avatar = githubUser.avatar_url;
    let email = githubUser.email;

    // 3. If primary email is private, fetch from /user/emails
    if (!email) {
      try {
        const emailsResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "Eduva-Academic-Tracker",
            Accept: "application/vnd.github+json",
          },
        });
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primaryEmail =
            emails.find((e) => e.primary && e.verified) ||
            emails.find((e) => e.verified) ||
            emails[0];
          if (primaryEmail?.email) {
            email = primaryEmail.email;
          }
        }
      } catch (emailErr) {
        console.warn("Could not fetch GitHub private emails:", emailErr.message);
      }
    }

    // Fallback if GitHub account has no accessible email
    if (!email) {
      email = `${githubUser.login}@users.noreply.github.com`;
    }

    // 4. Find or create user
    let user = await User.findOne({ githubId });

    if (!user) {
      // If user exists with the same email, link GitHub account
      user = await User.findOne({ email });
      if (user) {
        user.githubId = githubId;
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      } else {
        // Brand new user via GitHub
        user = await User.create({
          name,
          email,
          githubId,
          avatar,
        });
      }
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    console.error("GITHUB AUTH ERROR:", error);
    res.status(500).json({ message: error.message || "GitHub authentication failed" });
  }
};

// @desc  Request password reset email
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    // Always respond 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate a raw token (sent in email) and store its hash in DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      // Roll back token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("EMAIL SEND ERROR:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }

    res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reset password using token from email
// @route POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password; // pre-save hook bcrypts it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendAuthResponse(user, 200, res);
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
