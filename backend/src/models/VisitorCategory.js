import mongoose from "mongoose";

const visitorCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    requiresApproval: { type: Boolean, default: true },
    isDelivery: { type: Boolean, default: false },
    defaultValidityMinutes: { type: Number, default: 120 },
    icon: { type: String, default: "user" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("VisitorCategory", visitorCategorySchema);
