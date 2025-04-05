import express from "express";
import streamerRoutes from "./routes/streamerRoutes";
import userRoutes from "./routes/userRoutes";
import metadataRoutes from "./routes/metadataRoutes";
import { connectDB } from "./config/db";

import cors from "cors";

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

app.use(cors({ origin: "*" }));
// Middleware
app.use(express.json());

// Connect to DB
// connectDB();

// User Routes
app.use("/user", userRoutes);
// Streamer Routes
app.use("/streamer", streamerRoutes);
// Metadata Routes
app.use("/metadata", metadataRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
