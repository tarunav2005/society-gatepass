import Tower from "../models/Tower.js";
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "../utils/crudFactory.js";

export const createTower = createOne(Tower);
export const getTowers = getAll(Tower);
export const getTower = getOne(Tower);
export const updateTower = updateOne(Tower);
export const deleteTower = deleteOne(Tower);
