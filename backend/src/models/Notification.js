import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "visitor_request",
        "visitor_approved",
        "visitor_rejected",
        "delivery",
        "staff",
        "system",
      ],
      default: "system",
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g. visitor/staff ID
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
