// server.js
import express from "express";
import cors from "cors";
import { Pool } from "pg"
import dotenv from "dotenv"
//loading environment variables
dotenv.config()

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());  // Parse JSON bodies

//database configuration using pool

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database....");
});

pool.on("error", (err) => {
    console.log("Unexpected error on idle client", err);
    process.exit(-1);
});

class InventoryCRUD {
    //CREATE
    static async createInventory(
        inventoryName,
        category,
        price,
        unit,
        sourceCompany,
        availableQuantity,
        paymentStatus) {
        const query = `
           INSERT INTO inventory_management (
  "inventoryName",
  category,
  price,
  unit,
  "sourceCompany",
  "availableQuantity",
  "paymentStatus"
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;`;
        try {
            const result = await pool.query(query, [inventoryName, category, price, unit, sourceCompany, availableQuantity, paymentStatus])
            return {
                success: true,
                data: result.rows[0],
                message: "Item Added successfully"
            }
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to Add Item",
            };
        }
    }

    // READ
    static async getAllInventory() {
        const query = "SELECT * FROM inventory_management ORDER BY created_at DESC; ";
        try {
            const result = await pool.query(query)
            return {
                success: true,
                data: result.rows,
                count: result.rowCount,
                message: "Inventory Items retrieved successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to retrieve Inventory",
            };
        }
    }
    // READ ONE
    static async getInventoryById(id) {
        const query = "SELECT * FROM inventory_management WHERE id = $1;";

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return {
                    success: false,
                    message: "Item not found",
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "item retrieved successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to retrieve item",
            };
        }
    }

    //UPDATE
    static async updateInventory(id, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return {
                success: false,
                message: "No fields to update",
            };
        }

        // Build dynamic SET clause
        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(", ");

        const query = `
              UPDATE inventory_management
              SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
              WHERE id = $1 
              RETURNING *;
            `;

        try {
            const result = await pool.query(query, [id, ...values]);

            if (result.rowCount === 0) {
                return {
                    success: false,
                    message: "item not found",
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "item updated successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to update item",
            };
        }

    }

    static async deleteInventory(id) {
        const query = "DELETE FROM inventory_management WHERE id = $1 RETURNING *;"

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return {
                    success: false,
                    message: "Item not found",
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "Item deleted successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to delete Item",
            };
        }
    }
}

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to Malanad Agro Store Backend!');
});

app.get('/api/dashboard/inventory', async (req, res) => {
    const result = await InventoryCRUD.getAllInventory()
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);

});

app.post('/api/dashboard/inventory', async (req, res) => {
    const { inventoryName,
        category,
        price,
        unit,
        sourceCompany,
        availableQuantity,
        paymentStatus
    } = req.body


    const requiredFields = [
        "inventoryName",
        "category",
        "price",
        "unit",
        "sourceCompany",
        "availableQuantity",
        "paymentStatus"
    ];

    const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return value === undefined || value === null || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `The following fields are required: ${missingFields.join(', ')}`
        });
    }

    const result = await InventoryCRUD.createInventory(inventoryName,
        category,
        price,
        unit,
        sourceCompany,
        availableQuantity,
        paymentStatus)
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
})


app.get('/api/dashboard/inventory/:id', async (req, res) => {
    const result = await InventoryCRUD.getInventoryById(req.params.id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
});
app.put('/api/dashboard/inventory/:id', async (req, res) => {
    const result = await InventoryCRUD.updateInventory(req.params.id, req.body);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
});

app.delete("/api/dashboard/inventory/:id", async (req, res) => {
    const result = await InventoryCRUD.deleteInventory(req.params.id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
});

class OrderCRUD {
    // CREATE
    static async createOrder(
        inventoryid,
        inventoryname,
        price,
        ordertype,
        quantity,
        customername,
        customerlocation,
        paymentstatus,
        orderstatus,
        customerphone
    ) {
        const query = `
      INSERT INTO orders (
        "inventoryid",
        "inventoryname",
        "price",
        "ordertype",
        "quantity",
        "customername",
        "customerlocation",
        "paymentstatus",
        "orderstatus",
        "customerphone"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

        try {
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

            return {
                success: true,
                data: result.rows[0],
                message: "Order placed successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Order failed",
            };
        }
    }

    // READ ALL
    static async getAllOrders() {
        const query = "SELECT * FROM orders ORDER BY created_at DESC;";
        try {
            const result = await pool.query(query);
            return {
                success: true,
                data: result.rows,
                count: result.rowCount,
                message: "Orders retrieved successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to retrieve orders",
            };
        }
    }

    // READ ONE
    static async getOrderById(id) {
        const query = "SELECT * FROM orders WHERE id = $1;";

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "Order retrieved successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to retrieve order",
            };
        }
    }

    // UPDATE

    static async updateOrder(id, updates) {
        delete updates.unit
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        console.log("console updates", updates)
        if (fields.length === 0) {
            return {
                success: false,
                message: "No fields to update",
            };
        }

        // Build dynamic SET clause
        const setClause = fields
            .map((field, index) => `"${field}" = $${index + 2}`)
            .join(", ");
        console.log("console setClause", setClause)
        const query = `
      UPDATE orders
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

        try {
            const result = await pool.query(query, [id, ...values]);

            if (result.rowCount === 0) {
                return {
                    success: false,
                    message: "Order not found",
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "Order updated successfully",
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                message: "Failed to update order",
            };
        }
    }
}


app.post('/api/dashboard/orders', async (req, res) => {
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

    console.log('Received order:', req.body);

    // ✅ Step 1: Get inventory item from DB
    const inventoryResult = await pool.query(
        'SELECT * FROM inventory_management WHERE id = $1',
        [inventoryid]
    );

    if (inventoryResult.rowCount === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
    }

    const inventoryItem = inventoryResult.rows[0];

    const usedQuantityResult = await pool.query(
        "SELECT COALESCE(SUM(quantity), 0) AS total_used_quantity FROM used_inventory_quantity WHERE inventory_id = $1",
        [inventoryid]
    );

    // Step 3: Calculate remaining quantity
    // ✅ CORRECT
    const remainingQuantity = inventoryItem.availableQuantity;
    if (Number(quantity) > Number(remainingQuantity)) {
        return res.status(400).json({
            error: 'Requested quantity exceeds available quantity. Please adjust.'
        });
    }

    // ✅ Step 3: Check required fields
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

    const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return value === undefined || value === null || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `The following fields are required: ${missingFields.join(', ')}`,
        });
    }

    // ✅ Step 4: Create Order
    try {
        const result = await OrderCRUD.createOrder(
            inventoryid,
            inventoryname,
            price,
            ordertype,
            quantity,
            customername,
            customerlocation,
            paymentstatus,
            orderstatus,
            customerphone
        );

        // ✅ Step 5: On Success, Insert into used_inventory_quantity
        if (result.success) {
            try {
                await pool.query(
                    `INSERT INTO used_inventory_quantity (inventory_id, quantity, order_id)
                     VALUES ($1, $2, $3)`,
                    [inventoryid, quantity, result.data.id]
                );
                console.log('✅ Entry added to used_inventory_quantity');
            } catch (insertErr) {
                console.error('❌ Error inserting used_inventory_quantity:', insertErr.message);
                // You could optionally handle rollback logic here
            }

            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (err) {
        console.error('Order creation error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
});




app.get('/api/dashboard/orders', async (req, res) => {
    const result = await OrderCRUD.getAllOrders();
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
});

app.get('/api/dashboard/orders/:id', async (req, res) => {
    const result = await OrderCRUD.getOrderById(req.params.id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
});

app.put('/api/dashboard/orders/:id', async (req, res) => {
    const result = await OrderCRUD.updateOrder(req.params.id, req.body);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
