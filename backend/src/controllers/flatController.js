import Flat from "../models/Flat.js";
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
} from "../utils/crudFactory.js";
import { ApiError } from "../utils/ApiError.js";

export const createFlat = createOne(Flat);
export const getFlat = getOne(Flat, "tower primaryResident");
export const updateFlat = updateOne(Flat);
export const deleteFlat = deleteOne(Flat);

// Custom: filter by tower via query param, and populate for table display
export const getFlats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.tower) filter.tower = req.query.tower;
    const flats = await Flat.find(filter)
      .populate("tower", "name")
      .populate("primaryResident", "name email phone")
      .sort("flatNumber");
    res.status(200).json({ success: true, count: flats.length, data: flats });
  } catch (err) {
    next(err);
  }
};

export const getFlatEmergencyInfo = async (req, res, next) => {
  try {
    const flat = await Flat.findById(req.params.id).populate(
      "primaryResident",
      "name phone emergencyContact",
    );
    if (!flat) throw new ApiError(404, "Flat not found");
    res.status(200).json({ success: true, data: flat });
  } catch (err) {
    next(err);
  }
};

// Custom: list vacant flats only (used in resident approval dropdown)
export const getVacantFlats = async (req, res, next) => {
  try {
    const flats = await Flat.find({ status: "vacant" })
      .populate("tower", "name")
      .sort("flatNumber");
    res.status(200).json({ success: true, data: flats });
  } catch (err) {
    next(err);
  }
};
