import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "resident", "guard"],
      required: true,
    },
    // Resident-specific
    tower: { type: mongoose.Schema.Types.ObjectId, ref: "Tower" },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    // Guard-specific
    shift: { type: String, enum: ["day", "night", "rotating"] },
    // Approval workflow (residents & guards need admin approval)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: function () {
        return this.role === "admin" ? "approved" : "pending";
      },
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model("User", userSchema);
