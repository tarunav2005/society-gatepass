import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/visitorCategoryController.js";

const router = express.Router();
router.use(protect);

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post("/", authorize("admin"), createCategory);
router.patch("/:id", authorize("admin"), updateCategory);
router.delete("/:id", authorize("admin"), deleteCategory);

export default router;
