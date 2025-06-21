import {
  getTotalProfit,
  getAvailableInventory,
  getTotalItemSold,
  getTotalRentedItems,
  getPendingRents,
} from "../controllers/dashboard.controller.js";
import express from "express";

const router = express.Router();

router.get("/total-profit", getTotalProfit);
router.get("/available-inventories", getAvailableInventory);
router.get("/total-sold", getTotalItemSold);
router.get("/total-rented", getTotalRentedItems);
router.get("/pending-rents", getPendingRents);

export default router;
