import Blacklist from "../models/Blacklist.js";
import { ApiError } from "../utils/ApiError.js";

export const createBlacklistEntry = async (req, res, next) => {
  try {
    const { phone, name, reason } = req.body;
    const entry = await Blacklist.create({
      phone,
      name,
      reason,
      addedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    if (err.code === 11000)
      return next(
        new ApiError(409, "This phone number is already blacklisted"),
      );
    next(err);
  }
};

export const getBlacklist = async (req, res, next) => {
  try {
    const entries = await Blacklist.find()
      .populate("addedBy", "name")
      .sort("-createdAt");
    res
      .status(200)
      .json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    next(err);
  }
};

export const deleteBlacklistEntry = async (req, res, next) => {
  try {
    const entry = await Blacklist.findByIdAndDelete(req.params.id);
    if (!entry) throw new ApiError(404, "Entry not found");
    res.status(200).json({ success: true, message: "Removed from blacklist" });
  } catch (err) {
    next(err);
  }
};

// GUARD: check a phone number before registering (used for live warning)
export const checkBlacklist = async (req, res, next) => {
  try {
    const entry = await Blacklist.findOne({ phone: req.params.phone });
    res
      .status(200)
      .json({
        success: true,
        data: { blacklisted: !!entry, entry: entry || null },
      });
  } catch (err) {
    next(err);
  }
};
