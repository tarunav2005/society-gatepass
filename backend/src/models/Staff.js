import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    workingHours: {
      start: { type: String, default: "08:00" }, // "HH:MM" 24hr format
      end: { type: String, default: "20:00" },
    },
    allowedDays: [
      { type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
    ], // empty = all days
    role: {
      type: String,
      enum: ["maid", "cook", "driver", "gardener", "cleaner", "other"],
      required: true,
    },
    assignedFlats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flat" }],
    qrToken: { type: String, unique: true, sparse: true }, // permanent, doesn't expire
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // admin
  },
  { timestamps: true },
);

export default mongoose.model("Staff", staffSchema);
