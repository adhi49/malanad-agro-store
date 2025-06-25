// routes/order.routes.js
import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getPendingRentOrders,
  getUsedQuantity,
  updateOrder,
} from "../controllers/order.controller.js";
const router = express.Router();

router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/pending-orders", getPendingRentOrders)
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.get("/used-quantity/:inventoryId", getUsedQuantity);

export default router;
