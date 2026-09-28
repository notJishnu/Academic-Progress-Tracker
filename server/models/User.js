import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    // Optional: Google OAuth users won't have a password
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    // Google OAuth
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String }, // Google profile picture URL

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: { type: Date },
    completedDates: [String],
    totalStudyMinutes: { type: Number, default: 0 },
    completedGoalsCount: { type: Number, default: 0 },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        tier: { type: String },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    dailyLogs: [
      {
        date: { type: String, required: true },
        minutes: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Only hash if password is set and modified
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (entered) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);

