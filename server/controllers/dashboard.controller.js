// 1. Total profit in last 30 days (for Sell orders)

export const getTotalProfit = async () => {
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
}

// 2. Total available inventories (no 30-day filter)
export const getAvailableInventory = async () => {
    try {
        const result = await pool.query(`
      SELECT COUNT(*) FROM inventory_management WHERE "availableQuantity" ;
    `);
        res.json({ totalAvailable: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch available inventories", error: error.message });
    }
}

// 3. Total sold items in last 30 days
export const getTotalItemSold = async () => {
    try {
        const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Sell'
        AND "createdAt" >= CURRENT_DATE - INTERVAL '3 days'
    `);
        res.json({ totalSold: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sold items", error: error.message });
    }
}

// 4. Total rented items in last 30 days
export const getTotalRentedItems = async () => {
    try {
        const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Sell'
        AND "createdAt" >= CURRENT_DATE - INTERVAL '3 days'
    `);
        res.json({ totalSold: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sold items", error: error.message });
    }
}

// 5. Total pending rent items (no time filter)
export const getPendingRents = async () => {
    try {
        const result = await pool.query(`
      SELECT COUNT(*) FROM orders
      WHERE "orderType" = 'Rent'
        AND "orderStatus" = 'Pending'
    `);
        res.json({ pendingRents: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending rents", error: error.message });
    }
}