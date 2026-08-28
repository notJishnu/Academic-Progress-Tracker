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
        default: "#6366f1" 
    }
    },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);
