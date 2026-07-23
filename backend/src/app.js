import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import towerRoutes from "./routes/towerRoutes.js";
import flatRoutes from "./routes/flatRoutes.js";
import visitorCategoryRoutes from "./routes/visitorCategoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import blacklistRoutes from "./routes/blacklistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/staff", staffRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blacklist", blacklistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/towers", towerRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/visitor-categories", visitorCategoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API healthy" }),
);

app.use(notFound);
app.use(errorHandler);

export default app;
