import Visitor from "../models/Visitor.js";
import StaffAttendance from "../models/StaffAttendance.js";

export const getGuardDashboard = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      todayTotal,
      todayPending,
      currentlyInsideVisitors,
      currentlyInsideStaff,
      pendingDeliveries,
      recentActivity,
    ] = await Promise.all([
      Visitor.countDocuments({
        registeredBy: req.user._id,
        createdAt: { $gte: startOfDay },
      }),
      Visitor.countDocuments({ registeredBy: req.user._id, status: "pending" }),
      Visitor.find({ status: "checked_in" })
        .populate("category", "name")
        .populate("flat", "flatNumber")
        .populate("tower", "name")
        .sort("-checkedInAt")
        .limit(20),
      StaffAttendance.find({
        checkInAt: { $gte: startOfDay },
        checkOutAt: null,
      })
        .populate("staff", "name role")
        .populate("flat", "flatNumber")
        .sort("-checkInAt")
        .limit(20),
      Visitor.countDocuments({
        visitorType: "delivery",
        deliveryMode: "leave_at_gate",
        status: "approved",
      }),
      Visitor.find({ registeredBy: req.user._id })
        .populate("category", "name")
        .populate("flat", "flatNumber")
        .sort("-createdAt")
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayTotal,
        todayPending,
        currentlyInsideVisitors,
        currentlyInsideStaff,
        pendingDeliveries,
        recentActivity,
        insideCount:
          currentlyInsideVisitors.length + currentlyInsideStaff.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
