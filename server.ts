import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const app = express();
const PORT = 3000;

// Initialize SQLite Database
const db = new Database("pos_data.db");
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT
  )
`);

app.use(express.json());

// API Routes
app.get("/api/transactions", (req, res) => {
  try {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY timestamp DESC").all();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.post("/api/sync", (req, res) => {
  const { transactions } = req.body;
  
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO transactions (id, item_name, quantity, price, total, timestamp, user_id)
    VALUES (@id, @item_name, @quantity, @price, @total, @timestamp, @user_id)
  `);

  const transaction = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  try {
    transaction(transactions);
    res.json({ success: true, count: transactions.length });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync transactions" });
  }
});

// Auth simulation
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // Simple simulation
  if (username === "admin" && password === "admin") {
    res.json({ success: true, user: { id: "1", name: "Admin User" } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SyncPOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
