import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    tower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    flatNumber: { type: String, required: true, trim: true }, // e.g. "101"
    floor: { type: Number, required: true },
    status: {
      type: String,
      enum: ["occupied", "vacant"],
      default: "vacant",
    },
    primaryResident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

flatSchema.index({ tower: 1, flatNumber: 1 }, { unique: true });

export default mongoose.model("Flat", flatSchema);
