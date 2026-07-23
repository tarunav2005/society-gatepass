import jwt from "jsonwebtoken";
import QRCode from "qrcode";

// No expiry — this is a permanent staff ID token, revoked via isActive flag instead
export const generateStaffQRToken = (staffId) => {
  return jwt.sign(
    { staffId: staffId.toString(), purpose: "staff_pass" },
    process.env.JWT_QR_SECRET,
  );
};

export const verifyStaffQRToken = (token) => {
  return jwt.verify(token, process.env.JWT_QR_SECRET);
};

export const generateStaffQRImage = async (token) => {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: { dark: "#7c3aed", light: "#ffffff" }, // purple to visually distinguish from visitor QR (indigo)
  });
};
