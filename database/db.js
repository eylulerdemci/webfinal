const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "comments.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ SQLite bağlantı hatası:", err.message);
  } else {
    console.log("✅ SQLite veritabanı bağlandı");
  }
});

// TABLO OLUŞTUR
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    site TEXT,
    comment TEXT,
    rating INTEGER
  )
`);

module.exports = db;

