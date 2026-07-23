import VisitorCategory from "../models/VisitorCategory.js";
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "../utils/crudFactory.js";

export const createCategory = createOne(VisitorCategory);
export const getCategories = getAll(VisitorCategory);
export const getCategory = getOne(VisitorCategory);
export const updateCategory = updateOne(VisitorCategory);
export const deleteCategory = deleteOne(VisitorCategory);
