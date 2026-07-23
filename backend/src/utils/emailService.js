import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    if (!t) {
      console.warn("⚠️  Email not configured — skipping send to", to);
      return;
    }
    await t.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};
