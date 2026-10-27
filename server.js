const express = require("express");
const path = require("path");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Existing frontend files are served from the project root.
const projectRoot = path.join(__dirname, "..");

app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(projectRoot, "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(projectRoot, "script.js"));
});

// Check backend and database connection
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "Server and MySQL are connected",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, description, amount, type, created_at
       FROM transactions
       ORDER BY id DESC`,
    );

    res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error("Fetch transactions failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not load transactions",
    });
  }
});

// Add a transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const amount = Number(req.body.amount);
    const type = req.body.type;

    if (
      !description ||
      description.length > 255 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !["income", "expense"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid description, amount and type",
      });
    }

    // DECIMAL(12,2) supports at most 10 integer digits.
    if (amount >= 10000000000) {
      return res.status(400).json({
        success: false,
        message: "Amount is too large",
      });
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least 0.01",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO transactions (description, amount, type)
       VALUES (?, ?, ?)`,
      [description, roundedAmount, type],
    );

    const [rows] = await pool.execute(
      `SELECT id, description, amount, type, created_at
       FROM transactions
       WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction: rows[0],
    });
  } catch (error) {
    console.error("Add transaction failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not add transaction",
    });
  }
});

// Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM transactions WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not delete transaction",
    });
  }
});

// JSON error response for malformed JSON requests
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request",
    });
  }

  console.error("Unexpected server error:", error.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Expense Tracker running at http://localhost:${PORT}`);
      console.log("MySQL database connected successfully!");
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    console.error("Check your MySQL service and backend/.env settings.");
    process.exit(1);
  }
}

startServer();
