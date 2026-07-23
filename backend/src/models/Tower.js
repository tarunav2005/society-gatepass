import mongoose from "mongoose";

const towerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g. "Tower A"
    totalFloors: { type: Number, required: true, min: 1 },
    flatsPerFloor: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Tower", towerSchema);
