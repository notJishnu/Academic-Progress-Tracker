// models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }, // bcrypt-hashed
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date }, // last day the 5hr threshold was met
}, { timestamps: true });

// models/Section.js
const sectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: "#3b82f6" },
}, { timestamps: true });

// models/Goal.js
const goalSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  plannedMinutes: { type: Number, required: true, min: 5 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

// models/DailyLog.js — one doc per user per day
const dailyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" — simple + queryable
  minutes: [
    {
      goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
      minutes: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual: totalMinutes = sum of minutes array
