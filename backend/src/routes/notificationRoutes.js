import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  sendBroadcast,
} from "../controllers/notificationController.js";

const router = express.Router();
router.use(protect);

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.post("/broadcast", authorize("admin"), sendBroadcast);

export default router;
