import Staff from "../models/Staff.js";
import StaffAttendance from "../models/StaffAttendance.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateStaffQRToken,
  verifyStaffQRToken,
  generateStaffQRImage,
} from "../utils/staffQR.js";

// ADMIN: create staff profile + generate permanent QR
export const createStaff = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      role,
      assignedFlats,
      photo,
      workingHours,
      allowedDays,
    } = req.body;
    const staff = await Staff.create({
      name,
      phone,
      role,
      photo,
      assignedFlats: assignedFlats || [],
      workingHours: workingHours || undefined,
      allowedDays: allowedDays || [],
      createdBy: req.user._id,
    });
    staff.qrToken = generateStaffQRToken(staff._id);
    await staff.save();
    const populated = await staff.populate("assignedFlats", "flatNumber");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find()
      .populate({
        path: "assignedFlats",
        populate: { path: "tower", select: "name" },
      })
      .sort("-createdAt");
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    next(err);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("assignedFlats");
    if (!staff) throw new ApiError(404, "Staff not found");
    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      role,
      assignedFlats,
      photo,
      workingHours,
      allowedDays,
    } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, assignedFlats, photo, workingHours, allowedDays },
      { new: true, runValidators: true },
    ).populate("assignedFlats", "flatNumber");
    if (!staff) throw new ApiError(404, "Staff not found");
    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const toggleStaffActive = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) throw new ApiError(404, "Staff not found");
    staff.isActive = !staff.isActive;
    await staff.save();
    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) throw new ApiError(404, "Staff not found");
    await StaffAttendance.deleteMany({ staff: staff._id });
    res.status(200).json({ success: true, message: "Staff deleted" });
  } catch (err) {
    next(err);
  }
};

// Get QR image for a staff member (admin, or guard for printing)
export const getStaffQR = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) throw new ApiError(404, "Staff not found");
    if (!staff.qrToken)
      throw new ApiError(400, "No QR generated for this staff member");

    const qrImage = await generateStaffQRImage(staff.qrToken);
    res.status(200).json({ success: true, data: { qrImage } });
  } catch (err) {
    next(err);
  }
};

// GUARD: scan staff QR to log attendance (check-in or check-out depending on current state)
export const scanStaffQR = async (req, res, next) => {
  try {
    const { token, flat } = req.body;
    if (!token) throw new ApiError(400, "QR token is required");

    let decoded;
    try {
      decoded = verifyStaffQRToken(token);
    } catch {
      throw new ApiError(400, "Invalid or tampered staff QR code");
    }
    if (decoded.purpose !== "staff_pass")
      throw new ApiError(400, "This is not a staff pass");

    const staff = await Staff.findById(decoded.staffId).populate(
      "assignedFlats",
      "flatNumber",
    );
    if (!staff) throw new ApiError(404, "Staff record not found");
    if (!staff.isActive)
      throw new ApiError(403, "This staff member's access has been revoked");
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const today = dayMap[now.getDay()];

    if (staff.allowedDays?.length && !staff.allowedDays.includes(today)) {
      throw new ApiError(403, `${staff.name} is not scheduled to work today`);
    }
    if (staff.workingHours?.start && staff.workingHours?.end) {
      if (
        currentTime < staff.workingHours.start ||
        currentTime > staff.workingHours.end
      ) {
        throw new ApiError(
          403,
          `${staff.name}'s access is restricted to ${staff.workingHours.start}–${staff.workingHours.end}`,
        );
      }
    }
    if (staff.qrToken !== token)
      throw new ApiError(
        400,
        "QR code is no longer valid — a new one was issued",
      );

    // Find an open attendance record (checked in, not yet checked out) for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const openRecord = await StaffAttendance.findOne({
      staff: staff._id,
      checkInAt: { $gte: startOfDay },
      checkOutAt: null,
    });

    let record, action;
    if (openRecord) {
      openRecord.checkOutAt = new Date();
      await openRecord.save();
      record = openRecord;
      action = "checked_out";
    } else {
      record = await StaffAttendance.create({
        staff: staff._id,
        flat: flat || staff.assignedFlats[0]?._id,
        scannedBy: req.user._id,
      });
      action = "checked_in";
    }

    res.status(200).json({
      success: true,
      message:
        action === "checked_in"
          ? `${staff.name} checked in`
          : `${staff.name} checked out`,
      data: { action, staff, record },
    });
  } catch (err) {
    next(err);
  }
};

// Attendance history for a specific staff member
export const getStaffAttendance = async (req, res, next) => {
  try {
    const records = await StaffAttendance.find({ staff: req.params.id })
      .populate("flat", "flatNumber")
      .populate("scannedBy", "name")
      .sort("-checkInAt")
      .limit(100);
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

// RESIDENT: staff assigned to my flat + today's attendance status
export const getMyFlatStaff = async (req, res, next) => {
  try {
    if (!req.user.flat)
      throw new ApiError(400, "No flat assigned to your account");

    const staffList = await Staff.find({
      assignedFlats: req.user.flat,
      isActive: true,
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const withStatus = await Promise.all(
      staffList.map(async (s) => {
        const todayRecord = await StaffAttendance.findOne({
          staff: s._id,
          checkInAt: { $gte: startOfDay },
        }).sort("-checkInAt");
        return {
          ...s.toObject(),
          todayStatus: todayRecord
            ? todayRecord.checkOutAt
              ? "checked_out"
              : "checked_in"
            : "not_arrived",
          lastCheckIn: todayRecord?.checkInAt || null,
        };
      }),
    );

    res.status(200).json({ success: true, data: withStatus });
  } catch (err) {
    next(err);
  }
};

// GUARD/ADMIN: currently-inside staff (for live gate view)
export const getStaffCurrentlyInside = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await StaffAttendance.find({
      checkInAt: { $gte: startOfDay },
      checkOutAt: null,
    })
      .populate("staff", "name role phone")
      .populate("flat", "flatNumber")
      .sort("-checkInAt");

    res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};
