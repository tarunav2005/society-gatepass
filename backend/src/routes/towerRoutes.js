import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createTower,
  getTowers,
  getTower,
  updateTower,
  deleteTower,
} from "../controllers/towerController.js";

const router = express.Router();
router.use(protect); // any logged-in role can read

router.get("/", getTowers);
router.get("/:id", getTower);

router.post("/", authorize("admin"), createTower);
router.patch("/:id", authorize("admin"), updateTower);
router.delete("/:id", authorize("admin"), deleteTower);

export default router;
