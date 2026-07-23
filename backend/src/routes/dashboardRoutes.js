import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { getGuardDashboard } from "../controllers/dashboardController.js";
import { getAdminAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();
router.use(protect);

router.get("/guard", authorize("guard"), getGuardDashboard);
router.get("/admin", authorize("admin"), getAdminAnalytics);

export default router;
