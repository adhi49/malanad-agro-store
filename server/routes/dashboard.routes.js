import {
  getTotalProfit,
  getAvailableInventory,
  getTotalItemSold,
  getTotalRentedItems,
  getPendingRents,
  getPendingSales,
} from "../controllers/dashboard.controller.js";
import express from "express";

const router = express.Router();

router.get("/total-profit", getTotalProfit);
router.get("/available-inventories", getAvailableInventory);
router.get("/total-sold", getTotalItemSold);
router.get("/total-rented", getTotalRentedItems);
router.get("/pending-rents", getPendingRents);
router.get("/total-pending-sales", getPendingSales)

export default router;
