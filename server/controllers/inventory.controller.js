// controllers/inventory.controller.js
import { pool } from "../config/db.js";

export const createInventory = async (req, res) => {
  const { inventoryName, category, price, unit, sourceCompany, availableQuantity, paymentStatus, inventoryType, sellOrRentPrice } = req.body;

  const requiredFields = [
    "inventoryName",
    "category",
    "price",
    "unit",
    "sourceCompany",
    "availableQuantity",
    "paymentStatus",
    "inventoryType",
    "sellOrRentPrice"
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value.toString().trim() === "";
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing fields: ${missingFields.join(", ")}`,
    });
  }

  const query = `
    INSERT INTO inventory_management (
      "inventoryName", category, price, unit,
      "sourceCompany", "availableQuantity", "paymentStatus","inventoryType","sellOrRentPrice"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      inventoryName,
      category,
      price,
      unit,
      sourceCompany,
      availableQuantity,
      paymentStatus,
      inventoryType,
      sellOrRentPrice,
    ]);
    res.status(201).json({ success: true, message: "Inventory saved successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    const result = await pool.query(
      `SELECT * FROM inventory_management ORDER BY "createdAt" ASC LIMIT $1 OFFSET $2;`,
      [size, offset]
    );

    const countQuery = await pool.query(`SELECT COUNT(*) FROM inventory_management`);
    const totalItems = parseInt(countQuery.rows[0].count);

    res.status(200).json({
      success: true,
      page,
      size,
      totalItems,
      totalPages: Math.ceil(totalItems / size),
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getInventoryById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory_management WHERE id = $1;", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInventory = async (req, res) => {
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  if (fields.length === 0) {
    return res.status(400).json({ success: false, message: "No fields to update" });
  }

  const setClause = fields.map((field, i) => `"${field}" = $${i + 2}`).join(", ");
  const query = `
    UPDATE inventory_management
    SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1 RETURNING *;
  `;

  try {
    const result = await pool.query(query, [req.params.id, ...values]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }
    res.status(200).json({ success: true, message: "Inventory saved successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM inventory_management WHERE id = $1 RETURNING *;", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
