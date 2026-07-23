import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  toggleSuspend,
} from "../controllers/userController.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/pending", getPendingUsers);
router.get("/", getAllUsers);
router.patch("/:id/approve", approveUser);
router.patch("/:id/reject", rejectUser);
router.patch("/:id/suspend", toggleSuspend);

export default router;
