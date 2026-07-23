import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    reason: { type: String, required: true, trim: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Blacklist", blacklistSchema);
