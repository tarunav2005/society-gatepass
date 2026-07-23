import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createFlat,
  getFlats,
  getVacantFlats,
  getFlat,
  updateFlat,
  deleteFlat,
  getFlatEmergencyInfo,
} from "../controllers/flatController.js";

const router = express.Router();
router.use(protect);

router.get("/vacant", authorize("admin"), getVacantFlats);
router.get("/", getFlats);
router.get("/:id", getFlat);
router.get("/:id/emergency", authorize("guard", "admin"), getFlatEmergencyInfo);
router.post("/", authorize("admin"), createFlat);
router.patch("/:id", authorize("admin"), updateFlat);
router.delete("/:id", authorize("admin"), deleteFlat);

export default router;
