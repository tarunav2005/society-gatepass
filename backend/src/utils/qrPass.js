import jwt from "jsonwebtoken";
import QRCode from "qrcode";

// Generates a signed token + QR image (base64 data URL) for a visitor
export const generateQRPass = async (visitorId, validityMinutes = 120) => {
  const expiresIn = `${validityMinutes}m`;
  const token = jwt.sign(
    { visitorId: visitorId.toString(), purpose: "gate_pass" },
    process.env.JWT_QR_SECRET,
    {
      expiresIn,
    },
  );

  const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
  const qrImage = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
    color: { dark: "#4f46e5", light: "#ffffff" },
  });

  return { token, expiresAt, qrImage };
};

export const verifyQRToken = (token) => {
  return jwt.verify(token, process.env.JWT_QR_SECRET); // throws if invalid/expired
};
