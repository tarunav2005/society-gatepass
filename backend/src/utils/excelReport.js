import ExcelJS from "exceljs";

export const generateVisitorExcel = async (visitors) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Visitor History");

  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Type", key: "type", width: 12 },
    { header: "Category", key: "category", width: 15 },
    { header: "Tower", key: "tower", width: 12 },
    { header: "Flat", key: "flat", width: 10 },
    { header: "Resident", key: "resident", width: 18 },
    { header: "Registered By", key: "registeredBy", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Purpose", key: "purpose", width: 20 },
    { header: "Registered At", key: "createdAt", width: 20 },
    { header: "Checked In", key: "checkedInAt", width: 20 },
    { header: "Checked Out", key: "checkedOutAt", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  visitors.forEach((v) => {
    sheet.addRow({
      name: v.name,
      phone: v.phone,
      type: v.visitorType,
      category: v.category?.name || "—",
      tower: v.tower?.name || "—",
      flat: v.flat?.flatNumber || "—",
      resident: v.resident?.name || "—",
      registeredBy: v.registeredBy?.name || "—",
      status: v.status,
      purpose: v.purpose || "—",
      createdAt: new Date(v.createdAt).toLocaleString(),
      checkedInAt: v.checkedInAt
        ? new Date(v.checkedInAt).toLocaleString()
        : "—",
      checkedOutAt: v.checkedOutAt
        ? new Date(v.checkedOutAt).toLocaleString()
        : "—",
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const generateStaffAttendanceExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Staff Attendance");

  sheet.columns = [
    { header: "Staff Name", key: "name", width: 20 },
    { header: "Role", key: "role", width: 12 },
    { header: "Flat", key: "flat", width: 12 },
    { header: "Check In", key: "checkInAt", width: 20 },
    { header: "Check Out", key: "checkOutAt", width: 20 },
    { header: "Scanned By", key: "scannedBy", width: 18 },
  ];

  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  records.forEach((r) => {
    sheet.addRow({
      name: r.staff?.name || "—",
      role: r.staff?.role || "—",
      flat: r.flat?.flatNumber || "—",
      checkInAt: new Date(r.checkInAt).toLocaleString(),
      checkOutAt: r.checkOutAt
        ? new Date(r.checkOutAt).toLocaleString()
        : "Still inside",
      scannedBy: r.scannedBy?.name || "—",
    });
  });

  return workbook.xlsx.writeBuffer();
};
