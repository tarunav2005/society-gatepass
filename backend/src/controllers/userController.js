import User from "../models/User.js";
import Flat from "../models/Flat.js";
import { ApiError } from "../utils/ApiError.js";

export const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: "pending" })
      .populate("tower", "name")
      .populate("flat", "flatNumber")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    const users = await User.find(filter)
      .populate("tower", "name")
      .populate("flat", "flatNumber")
      .sort("-createdAt");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// Approve resident: requires tower+flat assignment; approve guard: just approve
export const approveUser = async (req, res, next) => {
  try {
    const { tower, flat } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.status !== "pending")
      throw new ApiError(400, "User is not pending approval");

    if (user.role === "resident") {
      if (!tower || !flat)
        throw new ApiError(400, "Tower and flat required to approve resident");
      const flatDoc = await Flat.findById(flat);
      if (!flatDoc) throw new ApiError(404, "Flat not found");

      user.tower = tower;
      user.flat = flat;
      flatDoc.status = "occupied";
      flatDoc.primaryResident = user._id;
      await flatDoc.save();
    }

    user.status = "approved";
    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({
        success: true,
        message: "User approved",
        data: user.toSafeObject(),
      });
  } catch (err) {
    next(err);
  }
};

export const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    user.status = "rejected";
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: "User rejected" });
  } catch (err) {
    next(err);
  }
};

export const toggleSuspend = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.role === "admin")
      throw new ApiError(403, "Cannot suspend an admin");
    user.status = user.status === "suspended" ? "approved" : "suspended";
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
