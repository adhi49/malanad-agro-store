import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // Just import to initiate connection
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Malanad Agro Store Backend is live!");
});

// Public routes (no authentication required)
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/dashboard/inventory", inventoryRoutes);
app.use("/api/dashboard/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Malanad Server running at http://localhost:${PORT}`);
});
