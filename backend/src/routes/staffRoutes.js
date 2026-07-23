import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  toggleStaffActive,
  deleteStaff,
  getStaffQR,
  scanStaffQR,
  getStaffAttendance,
  getMyFlatStaff,
  getStaffCurrentlyInside,
} from "../controllers/staffController.js";

const router = express.Router();
router.use(protect);

router.get("/mine", authorize("resident"), getMyFlatStaff);
router.get("/inside", authorize("guard", "admin"), getStaffCurrentlyInside);
router.post("/scan", authorize("guard"), scanStaffQR);

router.get("/", authorize("admin"), getAllStaff);
router.post("/", authorize("admin"), createStaff);
router.get("/:id", authorize("admin", "guard"), getStaff);
router.patch("/:id", authorize("admin"), updateStaff);
router.patch("/:id/toggle-active", authorize("admin"), toggleStaffActive);
router.delete("/:id", authorize("admin"), deleteStaff);
router.get("/:id/qr", authorize("admin", "guard"), getStaffQR);
router.get("/:id/attendance", authorize("admin"), getStaffAttendance);

export default router;
