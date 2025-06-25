// 1. Total profit in last 30 days (for Sell orders)

import { pool } from "../config/db.js";

export const getTotalProfit = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(price * quantity), 0) AS total_profit
      FROM orders
      WHERE "orderType" = 'Sell'
        AND "createdAt" >= CURRENT_DATE - INTERVAL '1 days'
    `);
    res.json({ totalProfit: result.rows[0].total_profit });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profit", error: error.message });
  }
};

// 2. Total available inventories (no 30-day filter)
export const getAvailableInventory = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM inventory_management WHERE "availableQuantity" > 0`);
    res.json({ totalAvailable: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available inventories", error: error.message });
  }
};

// 3. Total sold items in last 30 days
export const getTotalItemSold = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Sell'
        AND "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    `);
    res.json({ totalSold: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sold items", error: error.message });
  }
};

// 4. Total rented items in last 30 days
export const getTotalRentedItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Rent'
        AND "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    `);
    res.json({ totalRented: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sold items", error: error.message });
  }
};

// 5. Total pending rent items (no time filter)
export const getPendingRents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Rent'
       AND "orderStatus" NOT IN ('ORDER_COMPLETED', 'ORDER_CANCELLED')
    `);
    res.json({ pendingRents: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending rents", error: error.message });
  }
};

// 6. Total items selled (no time filter)
export const getPendingSales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*)FROM orders
      WHERE "orderType"= 'Sell'
    AND "orderStatus" NOT IN ('ORDER_COMPLETED', 'ORDER_CANCELLED')
      `)
    res.json({ pendingSales: parseInt(result.rows[0].count, 10) })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending sales", error: error.message })
  }
};


