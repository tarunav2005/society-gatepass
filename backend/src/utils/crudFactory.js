import { ApiError } from "./ApiError.js";

export const createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) return next(new ApiError(409, "Duplicate entry"));
    next(err);
  }
};

export const getAll =
  (Model, populateFields = "") =>
  async (req, res, next) => {
    try {
      const docs = await Model.find()
        .populate(populateFields)
        .sort("-createdAt");
      res.status(200).json({ success: true, count: docs.length, data: docs });
    } catch (err) {
      next(err);
    }
  };

export const getOne =
  (Model, populateFields = "") =>
  async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id).populate(populateFields);
      if (!doc) throw new ApiError(404, "Not found");
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  };

export const updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(404, "Not found");
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, "Not found");
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};
