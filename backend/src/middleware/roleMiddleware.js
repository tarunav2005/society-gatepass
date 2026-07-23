import { ApiError } from "../utils/ApiError.js";

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You don't have permission to perform this action"),
      );
    }
    next();
  };
