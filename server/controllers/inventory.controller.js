// controllers/inventory.controller.js
import { pool } from "../config/db.js";

export const createInventory = async (req, res) => {
  const { inventoryName, category, price, unit, sourceCompany, availableQuantity, paymentStatus } = req.body;

  const requiredFields = [
    "inventoryName",
    "category",
    "price",
    "unit",
    "sourceCompany",
    "availableQuantity",
    "paymentStatus",
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
      "sourceCompany", "availableQuantity", "paymentStatus"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
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
    ]);
    res.status(201).json({ success: true, message: "Inventory saved successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_management ORDER BY "createdAt" DESC;');
    res.status(200).json({ success: true, data: result.rows });
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
