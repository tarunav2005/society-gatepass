import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { notify } from "../utils/notify.js";
import { ApiError } from "../utils/ApiError.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort("-createdAt")
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const sendBroadcast = async (req, res, next) => {
  try {
    const { title, message, channels } = req.body;
    if (!title || !message)
      throw new ApiError(400, "Title and message are required");

    const residents = await User.find({ role: "resident", status: "approved" });

    await Promise.all(
      residents.map((r) =>
        notify({
          recipientId: r._id,
          title: `📢 ${title}`,
          message,
          type: "system",
          channels: channels || ["in_app", "email"],
        }),
      ),
    );

    res.status(200).json({
      success: true,
      message: `Broadcast sent to ${residents.length} residents`,
    });
  } catch (err) {
    next(err);
  }
};
