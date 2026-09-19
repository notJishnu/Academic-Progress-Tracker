import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    title: { type: String, required: [true, "Goal title is required"], trim: true },
    plannedMinutes: { type: Number, required: true, min: [5, "Minimum 5 minutes"] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);



const toDayStr = (d) => new Date(d).toISOString().slice(0, 10);

function isYesterday(dateStr) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return toDayStr(y) === dateStr;
}

const isToday = (dateStr) => toDayStr(new Date()) === dateStr;

module.exports = { toDayStr, isYesterday, isToday };


export default mongoose.model("Goal", goalSchema);
