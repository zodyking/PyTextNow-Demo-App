const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Get database path
const dbPath = path.join(process.cwd(), "data", "pytextnow.db");

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log("Database file does not exist. It will be created when the app runs.");
  process.exit(0);
}

// Connect to database
const db = new Database(dbPath);

try {
  // Clear all entries from users table
  const result = db.prepare("DELETE FROM users").run();
  console.log(`Cleared ${result.changes} entries from users table.`);
  
  // Vacuum to reclaim space
  db.prepare("VACUUM").run();
  console.log("Database cleaned and optimized.");
} catch (error) {
  console.error("Error clearing database:", error);
  process.exit(1);
} finally {
  db.close();
}

