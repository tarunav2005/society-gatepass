import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: "admin@society.com" });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }
  await User.create({
    name: "Society Admin",
    email: "admin@society.com",
    phone: "9999999999",
    password: "Admin@123",
    role: "admin",
  });
  console.log("✅ Admin created: admin@society.com / Admin@123");
  process.exit(0);
};

run();
