import Visitor from "../models/Visitor.js";
import Flat from "../models/Flat.js";
import VisitorCategory from "../models/VisitorCategory.js";
import { ApiError } from "../utils/ApiError.js";
import { emitToUser, emitToRole } from "../socket/index.js";
import { generateQRPass, verifyQRToken } from "../utils/qrPass.js";
import { notify } from "../utils/notify.js";

// GUARD: register a new visitor at the gate
export const registerVisitor = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      purpose,
      category,
      flat: flatId,
      courierCompany,
      packageCount,
      deliveryMode,
      idProofNumber,
      vehicleNumber,
      photo,
    } = req.body;

    const categoryDoc = await VisitorCategory.findById(category);
    if (!categoryDoc || !categoryDoc.isActive)
      throw new ApiError(404, "Invalid visitor category");

    const flatDoc = await Flat.findById(flatId).populate("primaryResident");
    if (!flatDoc) throw new ApiError(404, "Flat not found");
    if (!flatDoc.primaryResident)
      throw new ApiError(400, "This flat has no resident assigned");

    const isDelivery = categoryDoc.isDelivery;
    const isLeaveAtGate = isDelivery && deliveryMode === "leave_at_gate";
    const isAutoApproved = !categoryDoc.requiresApproval || isLeaveAtGate;

    const visitor = await Visitor.create({
      name,
      phone,
      purpose,
      category,
      idProofNumber,
      vehicleNumber,
      photo,
      visitorType: isDelivery ? "delivery" : "guest",
      courierCompany: isDelivery ? courierCompany : undefined,
      packageCount: isDelivery ? packageCount || 1 : undefined,
      deliveryMode: isDelivery ? deliveryMode || "hand_to_resident" : undefined,
      tower: flatDoc.tower,
      flat: flatDoc._id,
      resident: flatDoc.primaryResident._id,
      registeredBy: req.user._id,
      status: isAutoApproved ? "approved" : "pending",
      respondedAt: isAutoApproved ? new Date() : undefined,
    });

    if (isAutoApproved) {
      const { token, expiresAt } = await generateQRPass(
        visitor._id,
        categoryDoc.defaultValidityMinutes || 120,
      );
      visitor.qrToken = token;
      visitor.qrExpiresAt = expiresAt;
      await visitor.save();
    }

    const populated = await visitor.populate([
      { path: "category" },
      { path: "flat" },
      { path: "tower" },
      { path: "registeredBy", select: "name" },
    ]);

    if (!isAutoApproved) {
      emitToUser(flatDoc.primaryResident._id, "visitor:new_request", populated);
      notify({
        recipientId: flatDoc.primaryResident._id,
        title: "New Visitor Request",
        message: `${name} is at the gate (${categoryDoc.name}). Please approve or reject.`,
        type: "visitor_request",
        relatedId: visitor._id,
        channels: ["in_app", "email"],
      });
    } else if (isLeaveAtGate) {
      emitToUser(
        flatDoc.primaryResident._id,
        "visitor:delivery_left_at_gate",
        populated,
      );
      notify({
        recipientId: flatDoc.primaryResident._id,
        title: "Delivery Left at Gate",
        message: `${courierCompany || "A courier"} left ${packageCount || 1} package(s) for you at the gate.`,
        type: "delivery",
        relatedId: visitor._id,
        channels: ["in_app", "email"],
      });
    } else {
      emitToUser(
        flatDoc.primaryResident._id,
        "visitor:auto_approved",
        populated,
      );
      notify({
        recipientId: flatDoc.primaryResident._id,
        title: "Visitor Arrived",
        message: `${name} (${categoryDoc.name}) has arrived and been auto-approved.`,
        type: "visitor_approved",
        relatedId: visitor._id,
        channels: ["in_app"],
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// RESIDENT or GUARD: get the QR image for an approved visitor
export const getVisitorQR = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) throw new ApiError(404, "Visitor not found");

    const isOwner = visitor.resident.toString() === req.user._id.toString();
    const isRegisteringGuard =
      visitor.registeredBy.toString() === req.user._id.toString();
    if (!isOwner && !isRegisteringGuard && req.user.role !== "admin") {
      throw new ApiError(403, "Not authorized to view this pass");
    }

    if (!visitor.qrToken)
      throw new ApiError(400, "No QR pass generated for this visitor yet");
    if (visitor.qrExpiresAt < new Date())
      throw new ApiError(410, "QR pass has expired");

    const QRCode = (await import("qrcode")).default;
    const qrImage = await QRCode.toDataURL(visitor.qrToken, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: { dark: "#4f46e5", light: "#ffffff" },
    });

    res.status(200).json({
      success: true,
      data: { qrImage, expiresAt: visitor.qrExpiresAt },
    });
  } catch (err) {
    next(err);
  }
};

// GUARD: scan a QR code to check in a visitor
export const scanQRAndCheckIn = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, "QR token is required");

    let decoded;
    try {
      decoded = verifyQRToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError")
        throw new ApiError(410, "This QR pass has expired");
      throw new ApiError(400, "Invalid or tampered QR code");
    }

    const visitor = await Visitor.findById(decoded.visitorId)
      .populate("category", "name")
      .populate("flat", "flatNumber")
      .populate("tower", "name")
      .populate("resident", "name");

    if (!visitor) throw new ApiError(404, "Visitor record not found");
    if (visitor.qrToken !== token)
      throw new ApiError(400, "This QR code is no longer valid");

    if (visitor.status === "checked_in")
      throw new ApiError(409, "Visitor is already checked in");
    if (visitor.status === "checked_out")
      throw new ApiError(409, "This pass has already been used");
    if (visitor.status !== "approved")
      throw new ApiError(400, "Visitor is not approved for entry");

    visitor.status = "checked_in";
    visitor.checkedInAt = new Date();
    await visitor.save();

    emitToRole("admin", "visitor:checked_in", {
      id: visitor._id,
      name: visitor.name,
    });

    res.status(200).json({
      success: true,
      message: "Visitor checked in successfully",
      data: visitor,
    });
  } catch (err) {
    next(err);
  }
};

// RESIDENT: respond to a pending visitor request
export const respondToVisitor = async (req, res, next) => {
  try {
    const { decision, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      throw new ApiError(400, "Decision must be approved or rejected");
    }

    const visitor = await Visitor.findById(req.params.id).populate("category");
    if (!visitor) throw new ApiError(404, "Visitor request not found");
    if (visitor.resident.toString() !== req.user._id.toString()) {
      throw new ApiError(
        403,
        "You can only respond to your own visitor requests",
      );
    }
    if (visitor.status !== "pending")
      throw new ApiError(400, "This request has already been responded to");

    visitor.status = decision;
    visitor.respondedAt = new Date();

    if (decision === "approved") {
      const { token, expiresAt } = await generateQRPass(
        visitor._id,
        visitor.category.defaultValidityMinutes || 120,
      );
      visitor.qrToken = token;
      visitor.qrExpiresAt = expiresAt;
    } else if (rejectionReason) {
      visitor.rejectionReason = rejectionReason;
    }

    await visitor.save();

    const populated = await visitor.populate([
      { path: "category" },
      { path: "flat" },
      { path: "resident", select: "name" },
    ]);

    emitToUser(visitor.registeredBy, "visitor:status_updated", populated);
    notify({
      recipientId: visitor.registeredBy,
      title: decision === "approved" ? "Visitor Approved" : "Visitor Rejected",
      message: `${visitor.name} was ${decision} by the resident.`,
      type: decision === "approved" ? "visitor_approved" : "visitor_rejected",
      relatedId: visitor._id,
      channels: ["in_app"], // guard is on-shift, in-app is enough — no need to email them
    });

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// GUARD: mark an approved visitor as physically checked in
export const checkInVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) throw new ApiError(404, "Visitor not found");
    if (visitor.status !== "approved")
      throw new ApiError(400, "Only approved visitors can be checked in");

    visitor.status = "checked_in";
    visitor.checkedInAt = new Date();
    await visitor.save();

    emitToRole("admin", "visitor:checked_in", { id: visitor._id });
    res.status(200).json({ success: true, data: visitor });
  } catch (err) {
    next(err);
  }
};

export const checkOutVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) throw new ApiError(404, "Visitor not found");

    // Guard can check out anyone; resident can only check out their own visitor
    if (
      req.user.role === "resident" &&
      visitor.resident.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(
        403,
        "You can only check out visitors for your own flat",
      );
    }

    if (visitor.status !== "checked_in")
      throw new ApiError(400, "Visitor is not currently checked in");

    visitor.status = "checked_out";
    visitor.checkedOutAt = new Date();
    await visitor.save();

    emitToRole("admin", "visitor:checked_out", {
      id: visitor._id,
      name: visitor.name,
    });
    // Let the guard who registered this visitor know too, for their live log
    emitToUser(
      visitor.registeredBy,
      "visitor:status_updated",
      await visitor.populate([
        { path: "category" },
        { path: "flat" },
        { path: "resident", select: "name" },
      ]),
    );

    res.status(200).json({ success: true, data: visitor });
  } catch (err) {
    next(err);
  }
};

// GUARD: visitors registered by me today
export const getMyRegisteredVisitors = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const visitors = await Visitor.find({
      registeredBy: req.user._id,
      createdAt: { $gte: startOfDay },
    })
      .populate("category", "name")
      .populate("flat", "flatNumber")
      .populate("tower", "name")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    next(err);
  }
};

// RESIDENT: visitor requests for me (pending + history)
export const getMyVisitorRequests = async (req, res, next) => {
  try {
    const filter = { resident: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const visitors = await Visitor.find(filter)
      .populate("category", "name")
      .populate("registeredBy", "name")
      .sort("-createdAt")
      .limit(100);

    res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    next(err);
  }
};

// ADMIN/GUARD: currently inside the premises
export const getCurrentlyInside = async (req, res, next) => {
  try {
    const visitors = await Visitor.find({ status: "checked_in" })
      .populate("category", "name")
      .populate("flat", "flatNumber")
      .populate("tower", "name")
      .sort("-checkedInAt");
    res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    next(err);
  }
};

// GUARD: packages currently held at gate awaiting pickup
export const getPendingDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Visitor.find({
      visitorType: "delivery",
      deliveryMode: "leave_at_gate",
      status: "approved", // approved but not yet checked_out (picked up)
    })
      .populate("flat", "flatNumber")
      .populate("tower", "name")
      .populate("resident", "name phone")
      .sort("-createdAt");
    res
      .status(200)
      .json({ success: true, count: deliveries.length, data: deliveries });
  } catch (err) {
    next(err);
  }
};

// RESIDENT: invite a guest in advance (pre-approved, guard just verifies at gate)
export const inviteGuest = async (req, res, next) => {
  try {
    const { name, phone, purpose, category, expectedDate } = req.body;

    if (!req.user.flat)
      throw new ApiError(400, "No flat assigned to your account");

    const categoryDoc = await VisitorCategory.findById(category);
    if (!categoryDoc || !categoryDoc.isActive)
      throw new ApiError(404, "Invalid visitor category");

    const visitor = await Visitor.create({
      name,
      phone,
      purpose,
      category,
      visitorType: "guest",
      tower: req.user.tower,
      flat: req.user.flat,
      resident: req.user._id,
      registeredBy: req.user._id, // self-registered by resident
      status: "approved", // pre-approved by definition
      respondedAt: new Date(),
    });

    const { token, expiresAt } = await generateQRPass(
      visitor._id,
      categoryDoc.defaultValidityMinutes || 120,
    );
    visitor.qrToken = token;
    visitor.qrExpiresAt = expiresAt;
    await visitor.save();

    const populated = await visitor.populate([
      { path: "category" },
      { path: "flat" },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// GUARD: mark a "leave at gate" package as picked up by resident
export const markDeliveryPickedUp = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) throw new ApiError(404, "Delivery not found");
    if (
      visitor.visitorType !== "delivery" ||
      visitor.deliveryMode !== "leave_at_gate"
    ) {
      throw new ApiError(400, "This is not a leave-at-gate delivery");
    }
    if (visitor.status !== "approved")
      throw new ApiError(400, "Delivery already processed");

    visitor.status = "checked_out";
    visitor.checkedOutAt = new Date();
    await visitor.save();

    res
      .status(200)
      .json({ success: true, message: "Marked as picked up", data: visitor });
  } catch (err) {
    next(err);
  }
};

// ADMIN: full searchable/filterable/paginated visitor history
export const getAllVisitorsAdmin = async (req, res, next) => {
  try {
    const {
      search,
      status,
      category,
      tower,
      visitorType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tower) filter.tower = tower;
    if (visitorType) filter.visitorType = visitorType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [visitors, total] = await Promise.all([
      Visitor.find(filter)
        .populate("category", "name")
        .populate("tower", "name")
        .populate("flat", "flatNumber")
        .populate("resident", "name")
        .populate("registeredBy", "name")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Visitor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: visitors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};
