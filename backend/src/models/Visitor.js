import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    idProofNumber: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    photo: { type: String, default: "" },
    purpose: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitorCategory",
      required: true,
    },

    visitorType: {
      type: String,
      enum: ["guest", "delivery", "cab", "vendor", "staff"],
      default: "guest",
    },
    courierCompany: { type: String, trim: true }, // Amazon, Flipkart, Zomato, etc. - delivery only
    packageCount: { type: Number, default: 1 }, // delivery only
    deliveryMode: {
      type: String,
      enum: ["hand_to_resident", "leave_at_gate"],
      default: "hand_to_resident",
    },

    tower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tower",
      required: true,
    },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // guard

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "checked_in",
        "checked_out",
        "expired",
      ],
      default: "pending",
    },

    respondedAt: { type: Date },
    checkedInAt: { type: Date },
    checkedOutAt: { type: Date },
    rejectionReason: { type: String },
    qrToken: { type: String, default: null },
    qrExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

visitorSchema.index({ resident: 1, status: 1 });
visitorSchema.index({ registeredBy: 1, createdAt: -1 });

export default mongoose.model("Visitor", visitorSchema);
