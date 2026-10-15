import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import trackerRoutes from "./routes/tracker.js";

dotenv.config();

const app = express();

// ── Security Headers (OWASP A02: Security Misconfiguration) ───────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── CORS Configuration ───────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Cleanly reject non-whitelisted origins without throwing unhandled server error
      callback(null, false);
    },
    credentials: true,
  })
);

// ── Payload Size Limit (OWASP A05: DoS Protection) ───────────────────
app.use(express.json({ limit: "50kb" }));

// ── General API Rate Limiting (OWASP A07: Anti-Abuse) ─────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again in a few minutes.",
  },
});
app.use("/api", generalLimiter);

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Academic Progress Tracker API is running",
  });
});

// ── Centralized Error Handler (OWASP A09 & A10: Exception Handling) ───
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Unhandled error:", err.message);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    message: isProd ? "An unexpected error occurred" : err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();