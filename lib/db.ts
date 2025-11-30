import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Get database path
const dbPath = path.join(process.cwd(), "data", "pytextnow.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    textnow_username TEXT NOT NULL,
    sid_cookie TEXT NOT NULL,
    csrf_cookie TEXT NOT NULL,
    gemini_api_key TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index on username for faster lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_username ON users(username)
`);

export default db;


