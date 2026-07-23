import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createBlacklistEntry,
  getBlacklist,
  deleteBlacklistEntry,
  checkBlacklist,
} from "../controllers/blacklistController.js";

const router = express.Router();
router.use(protect);

router.get("/check/:phone", authorize("guard"), checkBlacklist);

router.get("/", authorize("admin"), getBlacklist);
router.post("/", authorize("admin"), createBlacklistEntry);
router.delete("/:id", authorize("admin"), deleteBlacklistEntry);

export default router;
