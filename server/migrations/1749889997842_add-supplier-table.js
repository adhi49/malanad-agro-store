/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

// migrations/[timestamp]_initial-setup-malanad-agro-tables.js
// This will be created when you run: npm run migrate:create initial-setup-malanad-agro-tables

export const up = (pgm) => {
  // Create inventory_management table
  pgm.createTable("inventory_management", {
    id: "id", // PostgreSQL serial primary key
    inventoryName: {
      type: "varchar(255)",
      notNull: true,
    },
    category: {
      type: "varchar(100)",
      notNull: true,
    },
    price: {
      type: "decimal(10,2)",
      notNull: true,
    },
    unit: {
      type: "varchar(50)",
      notNull: true,
    },
    sourceCompany: {
      type: "varchar(255)",
      notNull: true,
    },
    availableQuantity: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    paymentStatus: {
      type: "varchar(50)",
      notNull: true,
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updatedAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create orders table
  pgm.createTable("orders", {
    id: "id",
    inventoryId: {
      type: "integer",
      notNull: true,
      references: '"inventory_management"',
      onDelete: "restrict", // Prevent deletion of inventory if orders exist
      onUpdate: "cascade",
    },
    inventoryName: {
      type: "varchar(255)",
      notNull: true,
    },
    price: {
      type: "decimal(10,2)",
      notNull: true,
    },
    orderType: {
      type: "varchar(50)",
      notNull: true,
    },
    quantity: {
      type: "integer",
      notNull: true,
      check: "quantity > 0", // Ensure positive quantity
    },
    customerName: {
      type: "varchar(255)",
      notNull: true,
    },
    customerLocation: {
      type: "varchar(255)",
      notNull: true,
    },
    paymentStatus: {
      type: "varchar(50)",
      notNull: true,
    },
    orderStatus: {
      type: "varchar(50)",
      notNull: true,
    },
    customerPhone: {
      type: "varchar(20)",
      notNull: true,
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updatedAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create used_inventory_quantity table
  pgm.createTable("used_inventory_quantity", {
    id: "id",
    inventoryId: {
      type: "integer",
      notNull: true,
      references: '"inventory_management"',
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    quantity: {
      type: "integer",
      notNull: true,
      check: "quantity > 0",
    },
    orderId: {
      type: "integer",
      notNull: true,
      references: '"orders"',
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes for better performance
  pgm.createIndex("inventory_management", "category");
  pgm.createIndex("inventory_management", "paymentStatus");
  pgm.createIndex("orders", "inventoryId");
  pgm.createIndex("orders", "orderStatus");
  pgm.createIndex("orders", "paymentStatus");
  pgm.createIndex("orders", "createdAt");
  pgm.createIndex("used_inventory_quantity", "inventoryId");
  pgm.createIndex("used_inventory_quantity", "orderId");

  // Add a unique constraint to prevent duplicate inventory names
  pgm.addConstraint("inventory_management", "unique_inventory_name", {
    unique: ["inventoryName", "sourceCompany"],
  });

  // Add constraint to ensure used quantity doesn't exceed available
  pgm.sql(`
    CREATE OR REPLACE FUNCTION check_inventory_quantity()
    RETURNS TRIGGER AS $$
    BEGIN
        DECLARE
            available_qty INTEGER;
            total_used INTEGER;
        BEGIN
            SELECT "availableQuantity" INTO available_qty 
            FROM inventory_management 
            WHERE id = NEW."inventoryId";
            
            SELECT COALESCE(SUM(quantity), 0) INTO total_used
            FROM used_inventory_quantity 
            WHERE "inventoryId" = NEW."inventoryId";
            
            IF (total_used + NEW.quantity) > available_qty THEN
                RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %, Already used: %', 
                    available_qty, NEW.quantity, total_used;
            END IF;
            
            RETURN NEW;
        END;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE TRIGGER trigger_check_inventory_quantity
        BEFORE INSERT ON used_inventory_quantity
        FOR EACH ROW
        EXECUTE FUNCTION check_inventory_quantity();
  `);
};

export const down = (pgm) => {
  // Drop trigger and function first
  pgm.sql("DROP TRIGGER IF EXISTS trigger_check_inventory_quantity ON used_inventory_quantity;");
  pgm.sql("DROP FUNCTION IF EXISTS check_inventory_quantity();");

  // Drop tables in reverse order (due to foreign keys)
  pgm.dropTable("used_inventory_quantity");
  pgm.dropTable("orders");
  pgm.dropTable("inventory_management");
};
