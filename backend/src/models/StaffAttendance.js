import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" }, // which flat they're visiting this entry (optional, guard can select)
    checkInAt: { type: Date, default: Date.now },
    checkOutAt: { type: Date, default: null },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // guard
  },
  { timestamps: true },
);

staffAttendanceSchema.index({ staff: 1, createdAt: -1 });

export default mongoose.model("StaffAttendance", staffAttendanceSchema);
