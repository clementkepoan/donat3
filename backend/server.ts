import express from "express";
import platformRoutes from "./routes/platformRoutes";
import userRoutes from "./routes/userRoutes";
import { connectDB } from "./config/db";

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import xss from "xss-clean";
// import rateLimit from "express-rate-limit";
// import hpp from "hpp";
// import path from "path";
// import expressSanitizer from "express-sanitizer";
// import { cookieParser } from "cookie-parser";

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(express.json());
// app.use(cookieParser());
// app.use(handleCookies);

// Connect to DB
// connectDB();

// User Routes
app.use("/user", userRoutes);
// Platform Routes
app.use("/platform", platformRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
