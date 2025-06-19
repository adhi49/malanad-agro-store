// controllers/order.controller.js
import { pool } from "../config/db.js";

const ORDER_TYPES = {
  SELL: "Sell",
  RENT: "Rent",
};

export const createOrder = async (req, res) => {
  const {
    inventoryId,
    inventoryName,
    price,
    orderType,
    quantity,
    customerName,
    customerLocation,
    paymentStatus,
    orderStatus,
    customerPhone,
    dueDateTime,
  } = req.body;

  console.log({ orderType });
  const requiredFields = [
    "inventoryId",
    "inventoryName",
    "price",
    "orderType",
    "quantity",
    "customerName",
    "customerLocation",
    "paymentStatus",
    "orderStatus",
    "customerPhone",
    ...(orderType === ORDER_TYPES.RENT ? ["dueDateTime"] : []),
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

  const inventoryResult = await pool.query("SELECT * FROM inventory_management WHERE id = $1", [inventoryId]);

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
          "inventoryId",
          "inventoryName",
          "price",
          "orderType",
          "quantity",
          "customerName",
          "customerLocation",
          "paymentStatus",
          "orderStatus",
          "customerPhone",
          "dueDateTime"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
    const result = await pool.query(query, [
      inventoryId,
      inventoryName,
      price,
      orderType,
      quantity,
      customerName,
      customerLocation,
      paymentStatus,
      orderStatus,
      customerPhone,
      dueDateTime,
    ]);

    await pool.query(
      `INSERT INTO used_inventory_quantity ("inventoryId", quantity, "orderId")
         VALUES ($1, $2, $3)`,
      [inventoryId, quantity, result.rows[0].id]
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
};

export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY "createdAt" DESC;');
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
};

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
};

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

  const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(", ");

  const query = `
      UPDATE orders
      SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
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
};

export const getUsedQuantity = async (req, res) => {
  const { inventoryId } = req.params;
  console.log("Requested Inventory ID:", inventoryId);

  try {
    const usedResult = await pool.query(
      `SELECT SUM(quantity) as total_used FROM used_inventory_quantity WHERE "inventoryId" = $1`,
      [inventoryId]
    );

    const inventoryResult = await pool.query("SELECT * FROM inventory_management WHERE id = $1", [inventoryId]);

    if (inventoryResult.rowCount === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    const inventoryItem = inventoryResult.rows[0];
    const availableQuantity = inventoryItem.availableQuantity;

    const totalUsedQuantity = usedResult.rows[0]?.total_used || 0;
    const finalAvailable = availableQuantity - totalUsedQuantity;

    res.status(200).json({
      used: Number(totalUsedQuantity),
      availableQuantity: finalAvailable,
      message: "Fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
