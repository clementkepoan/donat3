import express from "express";
import streamerRoutes from "./routes/streamerRoutes";
import userRoutes from "./routes/userRoutes";
import { connectDB } from "./config/db";

import cookieParser from "cookie-parser";

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

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to DB
// connectDB();

// User Routes
app.use("/user", userRoutes);
// Streamer Routes
app.use("/streamer", streamerRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
