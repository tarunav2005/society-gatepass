import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  exportVisitorsExcel,
  exportVisitorsPDF,
  exportStaffAttendanceExcel,
  exportResidentWiseReport,
  exportFrequencyReport,
  exportBlacklistReport,
} from "../controllers/reportController.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/visitors/excel", exportVisitorsExcel);
router.get("/visitors/pdf", exportVisitorsPDF);
router.get("/staff-attendance/excel", exportStaffAttendanceExcel);
router.get("/resident/:residentId/excel", exportResidentWiseReport);
router.get("/frequency/excel", exportFrequencyReport);
router.get("/blacklist/excel", exportBlacklistReport);

export default router;
