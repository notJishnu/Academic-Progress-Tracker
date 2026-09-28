import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    name: { 
        type: String, 
        required: [true, "Section name is required"], 
        trim: true 
    },
    color: { 
        type: String, 
        default: "#2E6F40" 
    },
    targetHours: {
        type: Number,
        default: 20,
        min: [1, "Target must be at least 1 hour"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);
