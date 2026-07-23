import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  registerVisitor,
  respondToVisitor,
  checkInVisitor,
  checkOutVisitor,
  getMyRegisteredVisitors,
  getMyVisitorRequests,
  getCurrentlyInside,
  getVisitorQR,
  scanQRAndCheckIn,
  getPendingDeliveries,
  markDeliveryPickedUp,
  getAllVisitorsAdmin,
  inviteGuest,
} from "../controllers/visitorController.js";

const router = express.Router();
router.use(protect);

router.post("/", authorize("guard"), registerVisitor);
router.get("/mine", authorize("guard"), getMyRegisteredVisitors);
router.patch("/:id/respond", authorize("resident"), respondToVisitor);
router.patch("/:id/check-in", authorize("guard"), checkInVisitor);
router.patch("/:id/check-out", authorize("guard", "resident"), checkOutVisitor);
router.get("/requests", authorize("resident"), getMyVisitorRequests);
router.get("/inside", authorize("guard", "admin"), getCurrentlyInside);
router.get("/admin/all", authorize("admin"), getAllVisitorsAdmin);
router.post("/invite", authorize("resident"), inviteGuest);

router.get("/:id/qr", getVisitorQR);
router.post("/scan", authorize("guard"), scanQRAndCheckIn);
router.get(
  "/deliveries/pending",
  authorize("guard", "admin"),
  getPendingDeliveries,
);
router.patch("/:id/pickup", authorize("guard"), markDeliveryPickedUp);

export default router;
