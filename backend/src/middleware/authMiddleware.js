import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Not authenticated");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "User no longer exists");
    if (user.status !== "approved")
      throw new ApiError(403, "Account not approved yet");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired"));
    }
    next(err instanceof ApiError ? err : new ApiError(401, "Invalid token"));
  }
};
