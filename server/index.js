import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // Just import to initiate connection
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Malanad Agro Store Backend is live!");
});

// Routes
app.use("/api/dashboard/inventory", inventoryRoutes);
app.use("/api/dashboard/orders", orderRoutes);


// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Malanad Server running at http://localhost:${PORT}`);
});
