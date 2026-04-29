import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model";

dotenv.config();

const seedAdmin = async () => {
  try {
    // ✅ 1. Validate env
    if (!process.env.DB_URI) {
      throw new Error("DB_URI is not defined in .env");
    }

    // ✅ 2. Connect DB
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB connected");

    const users = [
      {
        first_name: "Super Admin",
        last_name: "Super Admin",
        email: "admin@yopmail.com",
        role: "Admin",
      },
      {
        first_name: "ankita",
        last_name: "modi",
        email: "ankita@yopmail.com",
        role: "User",
      },
    ];

    // ✅ 3. Loop users (cleaner + scalable)
    for (const user of users) {
      const existingUser = await User.findOne({
        email: user.email,
        deleted_at: null,
      });

      if (existingUser) {
        console.log(`Deleting existing user: ${user.email}`);
        await User.deleteOne({ _id: existingUser._id });
      }

      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await User.create({
        ...user,
        password: hashedPassword,
      });

      console.log(`Created user: ${user.email}`);
    }

    console.log("✅ Seeder completed successfully 🚀");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
};

seedAdmin();
