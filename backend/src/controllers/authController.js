import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, tower, flat, shift } = req.body;

    if (!["resident", "guard"].includes(role)) {
      throw new ApiError(
        400,
        "Public registration only allowed for resident or guard",
      );
    }

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "Email already registered");

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      tower: role === "resident" ? tower : undefined,
      flat: role === "resident" ? flat : undefined,
      shift: role === "guard" ? shift : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted. Awaiting admin approval.",
      data: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }
    if (user.status === "pending")
      throw new ApiError(403, "Account pending admin approval");
    if (user.status === "rejected")
      throw new ApiError(403, "Account registration was rejected");
    if (user.status === "suspended" || !user.isActive)
      throw new ApiError(403, "Account suspended");

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200).json({
      success: true,
      data: { user: user.toSafeObject(), accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new ApiError(401, "No refresh token");

    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const accessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    next(new ApiError(401, "Session expired, please log in again"));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { emergencyContact } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContact },
      { new: true, runValidators: true },
    );
    res.status(200).json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.updateOne(
        { refreshToken: token },
        { $unset: { refreshToken: 1 } },
      );
    }
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
};
