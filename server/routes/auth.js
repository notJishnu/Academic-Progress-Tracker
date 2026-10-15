import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
  googleAuth,
  githubAuth,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = Router();

// ── Strict Auth Rate Limiting (OWASP A07: Brute Force & Credential Stuffing) ─
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts from this IP, please try again in 15 minutes.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset requests from this IP, please try again later.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleAuth);
router.post("/github", authLimiter, githubAuth);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

router.get("/me", protect, getMe);
router.patch("/update-profile", protect, updateProfile);
router.delete("/delete-account", protect, deleteAccount);

export default router;
