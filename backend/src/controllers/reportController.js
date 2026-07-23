import ExcelJS from "exceljs";
import Visitor from "../models/Visitor.js";
import StaffAttendance from "../models/StaffAttendance.js";
import Blacklist from "../models/Blacklist.js";
import {
  generateVisitorExcel,
  generateStaffAttendanceExcel,
} from "../utils/excelReport.js";
import { generateVisitorPDF } from "../utils/pdfReport.js";

const buildVisitorFilter = (query) => {
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.tower) filter.tower = query.tower;
  if (query.visitorType) filter.visitorType = query.visitorType;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return filter;
};

export const exportVisitorsExcel = async (req, res, next) => {
  try {
    const filter = buildVisitorFilter(req.query);
    const visitors = await Visitor.find(filter)
      .populate("category", "name")
      .populate("tower", "name")
      .populate("flat", "flatNumber")
      .populate("resident", "name")
      .populate("registeredBy", "name")
      .sort("-createdAt");

    const buffer = await generateVisitorExcel(visitors);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=visitor-report-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const exportVisitorsPDF = async (req, res, next) => {
  try {
    const filter = buildVisitorFilter(req.query);
    const visitors = await Visitor.find(filter)
      .populate("category", "name")
      .populate("tower", "name")
      .populate("flat", "flatNumber")
      .populate("resident", "name")
      .sort("-createdAt")
      .limit(500);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=visitor-report-${Date.now()}.pdf`,
    );

    const doc = generateVisitorPDF(visitors, req.query);
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const exportStaffAttendanceExcel = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.staffId) filter.staff = req.query.staffId;
    if (req.query.startDate || req.query.endDate) {
      filter.checkInAt = {};
      if (req.query.startDate)
        filter.checkInAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.checkInAt.$lte = end;
      }
    }

    const records = await StaffAttendance.find(filter)
      .populate("staff", "name role")
      .populate("flat", "flatNumber")
      .populate("scannedBy", "name")
      .sort("-checkInAt");

    const buffer = await generateStaffAttendanceExcel(records);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=staff-attendance-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const exportResidentWiseReport = async (req, res, next) => {
  try {
    const visitors = await Visitor.find({ resident: req.params.residentId })
      .populate("category", "name")
      .populate("registeredBy", "name")
      .sort("-createdAt");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Resident Visitor Report");
    sheet.columns = [
      { header: "Visitor", key: "name", width: 20 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Registered By", key: "registeredBy", width: 18 },
      { header: "Date", key: "createdAt", width: 22 },
    ];
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6366F1" },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    visitors.forEach((v) =>
      sheet.addRow({
        name: v.name,
        category: v.category?.name || "—",
        status: v.status,
        registeredBy: v.registeredBy?.name || "—",
        createdAt: new Date(v.createdAt).toLocaleString(),
      }),
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=resident-report-${Date.now()}.xlsx`,
    );
    res.send(await workbook.xlsx.writeBuffer());
  } catch (err) {
    next(err);
  }
};

export const exportFrequencyReport = async (req, res, next) => {
  try {
    const frequent = await Visitor.aggregate([
      {
        $group: {
          _id: { name: "$name", phone: "$phone" },
          visits: { $sum: 1 },
          lastVisit: { $max: "$createdAt" },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 100 },
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Visitor Frequency");
    sheet.columns = [
      { header: "Visitor Name", key: "name", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Total Visits", key: "visits", width: 15 },
      { header: "Last Visit", key: "lastVisit", width: 22 },
    ];
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6366F1" },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    frequent.forEach((f) =>
      sheet.addRow({
        name: f._id.name,
        phone: f._id.phone,
        visits: f.visits,
        lastVisit: new Date(f.lastVisit).toLocaleString(),
      }),
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=frequency-report-${Date.now()}.xlsx`,
    );
    res.send(await workbook.xlsx.writeBuffer());
  } catch (err) {
    next(err);
  }
};

export const exportBlacklistReport = async (req, res, next) => {
  try {
    const entries = await Blacklist.find()
      .populate("addedBy", "name")
      .sort("-createdAt");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Blacklist Report");
    sheet.columns = [
      { header: "Phone", key: "phone", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Reason", key: "reason", width: 30 },
      { header: "Added By", key: "addedBy", width: 18 },
      { header: "Date Added", key: "createdAt", width: 22 },
    ];
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEF4444" },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    entries.forEach((e) =>
      sheet.addRow({
        phone: e.phone,
        name: e.name || "—",
        reason: e.reason,
        addedBy: e.addedBy?.name || "—",
        createdAt: new Date(e.createdAt).toLocaleString(),
      }),
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=blacklist-report-${Date.now()}.xlsx`,
    );
    res.send(await workbook.xlsx.writeBuffer());
  } catch (err) {
    next(err);
  }
};
