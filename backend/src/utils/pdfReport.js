import PDFDocument from "pdfkit";

export const generateVisitorPDF = (visitors, filters = {}) => {
  const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

  doc
    .fontSize(18)
    .fillColor("#4f46e5")
    .text("Society GatePass — Visitor Report", { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });
  if (Object.keys(filters).length) {
    doc.text(`Filters: ${JSON.stringify(filters)}`, { align: "center" });
  }
  doc.moveDown(1);

  const headers = [
    "Name",
    "Phone",
    "Category",
    "Location",
    "Resident",
    "Status",
    "Date",
  ];
  const colWidths = [90, 80, 80, 90, 90, 80, 130];
  let y = doc.y;

  const drawRow = (cells, isHeader = false) => {
    let x = 40;
    doc.fontSize(9).fillColor(isHeader ? "#ffffff" : "#1e293b");
    if (isHeader) {
      doc
        .rect(
          40,
          y,
          colWidths.reduce((a, b) => a + b, 0),
          20,
        )
        .fill("#6366f1");
      doc.fillColor("#ffffff");
    }
    cells.forEach((cell, i) => {
      doc.text(String(cell), x + 4, y + 5, {
        width: colWidths[i] - 8,
        height: 15,
        ellipsis: true,
      });
      x += colWidths[i];
    });
    y += 22;
  };

  drawRow(headers, true);

  visitors.forEach((v) => {
    if (y > 500) {
      doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
      y = 40;
      drawRow(headers, true);
    }
    drawRow([
      v.name,
      v.phone,
      v.category?.name || "—",
      `${v.tower?.name || ""} - ${v.flat?.flatNumber || ""}`,
      v.resident?.name || "—",
      v.status.replace("_", " "),
      new Date(v.createdAt).toLocaleDateString(),
    ]);
  });

  doc.end();
  return doc;
};
