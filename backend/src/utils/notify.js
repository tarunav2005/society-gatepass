import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";
import { sendSMS } from "./smsService.js";
import { emitToUser } from "../socket/index.js";

/**
 * Fires a notification across all channels: in-app (DB + socket), email, SMS.
 * Email/SMS are best-effort — failures don't block the main flow.
 */
export const notify = async ({
  recipientId,
  title,
  message,
  type = "system",
  relatedId,
  channels = ["in_app", "email"], // add "sms" explicitly when needed (costs money/quota)
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      relatedId,
    });

    if (channels.includes("in_app")) {
      emitToUser(recipientId, "notification:new", notification);
    }

    const user = await User.findById(recipientId);
    if (!user) return notification;

    if (channels.includes("email") && user.email) {
      sendEmail({
        to: user.email,
        subject: title,
        html: `<div style="font-family:sans-serif;padding:20px"><h2>${title}</h2><p>${message}</p></div>`,
      }); // fire-and-forget, not awaited to avoid blocking
    }

    if (channels.includes("sms") && user.phone) {
      sendSMS({ to: user.phone, body: `${title}: ${message}` });
    }

    return notification;
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
};
