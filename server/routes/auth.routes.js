// File: routes/auth.routes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
    console.log({ userName });

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE "userName" = $1', [userName]);
    console.log("userResult", userResult?.rows);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userName: user.userName, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    });

    // Deactivate old login sessions
    await pool.query('UPDATE logins SET "isActive" = FALSE WHERE "userName" = $1', [userName]);

    // Create new login entry
    await pool.query('INSERT INTO logins ("userName", token, "lastLogin") VALUES ($1, $2, CURRENT_TIMESTAMP)', [
      userName,
      token,
    ]);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userName: user.userName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Logout endpoint
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      // Deactivate the token
      await pool.query('UPDATE logins SET "isActive" = FALSE WHERE token = $1', [token]);
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Verify token endpoint
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Check if token is active in database
    const loginResult = await pool.query('SELECT * FROM logins WHERE token = $1 AND "isActive" = TRUE', [token]);

    if (loginResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    res.json({
      success: true,
      user: {
        userName: decoded.userName,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

export default router;
