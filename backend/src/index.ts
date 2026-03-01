import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import mealRoutes from "./routes/mealRoutes";
import statsRoutes from "./routes/statsRoutes";
import { setupTelegramBot } from "./telegram/bot";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Set timeout for long-running requests (Gemini API calls can take 20-60 seconds)
app.use((req, res, next) => {
  req.setTimeout(120000); // 120 seconds
  res.setTimeout(120000); // 120 seconds
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/stats", statsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await connectDatabase(
      process.env.MONGODB_URI || "mongodb://localhost:27017/calories-tracker",
    );

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    setupTelegramBot();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
