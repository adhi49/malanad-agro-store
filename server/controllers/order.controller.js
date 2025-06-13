// controllers/order.controller.js
import { pool } from "../config/db.js";

export const createOrder = async (req, res) => {
    const {
        inventoryid,
        inventoryname,
        price,
        ordertype,
        quantity,
        customername,
        customerlocation,
        paymentstatus,
        orderstatus,
        customerphone,
    } = req.body;

    const requiredFields = [
        "inventoryid",
        "inventoryname",
        "price",
        "ordertype",
        "quantity",
        "customername",
        "customerlocation",
        "paymentstatus",
        "orderstatus",
        "customerphone",
    ];

    const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];
        return value === undefined || value === null || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `The following fields are required: ${missingFields.join(", ")}`,
        });
    }

    const inventoryResult = await pool.query(
        "SELECT * FROM inventory_management WHERE id = $1",
        [inventoryid]
    );

    if (inventoryResult.rowCount === 0) {
        return res.status(404).json({ error: "Inventory item not found" });
    }

    const inventoryItem = inventoryResult.rows[0];
    const remainingQuantity = inventoryItem.availableQuantity;

    if (Number(quantity) > Number(remainingQuantity)) {
        return res.status(400).json({
            error: "Requested quantity exceeds available quantity. Please adjust.",
        });
    }

    try {
        const query = `
        INSERT INTO orders (
          inventoryid, inventoryname, price, ordertype, quantity,
          customername, customerlocation, paymentstatus, orderstatus, customerphone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
        const result = await pool.query(query, [
            inventoryid,
            inventoryname,
            price,
            ordertype,
            quantity,
            customername,
            customerlocation,
            paymentstatus,
            orderstatus,
            customerphone,
        ]);

        await pool.query(
            `INSERT INTO used_inventory_quantity (inventory_id, quantity, order_id)
         VALUES ($1, $2, $3)`,
            [inventoryid, quantity, result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: "Order placed successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC;");
        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rowCount,
            message: "Orders retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: err.message,
        });
    }

}

export const getOrderById = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM orders WHERE id = $1;", [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
            message: "Order retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve order",
            error: err.message,
        });
    }
}

export const updateOrder = async (req, res) => {
    const updates = req.body;
    delete updates.unit;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No fields to update",
        });
    }

    const setClause = fields
        .map((field, index) => `"${field}" = $${index + 2}`)
        .join(", ");

    const query = `
      UPDATE orders
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
        const result = await pool.query(query, [req.params.id, ...values]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
            message: "Order updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update order",
            error: err.message,
        });
    }
}

export const getUsedQuantity = async (req, res) => {
    const { inventoryId, availableQuantity } = req.params;
    console.log("Requested Inventory ID:", inventoryId, availableQuantity);


    try {
        const usedResult = await pool.query(
            `SELECT SUM(quantity) as total_used FROM used_inventory_quantity WHERE inventory_id = $1`,
            [inventoryId]
        );

        const totalUsedQuantity = usedResult.rows[0]?.total_used || 0;
        const finalAvailable = availableQuantity - totalUsedQuantity;

        res.status(200).json({
            used: Number(totalUsedQuantity),
            availableQuantity: finalAvailable,
            message: "Fetched successfully"
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
