const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_FILE = "db.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ keys: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateKey() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

app.get("/create", (req, res) => {
  const { days = 7 } = req.query;

  let db = loadDB();
  let key = generateKey();

  db.keys[key] = {
    used: false,
    user: null,
    expires: Date.now() + (days * 86400000),
    blacklisted: false
  };

  saveDB(db);

  res.json({ key });
});

app.get("/check", (req, res) => {
  const { key, user } = req.query;
  let db = loadDB();

  if (!db.keys[key]) {
    return res.json({ valid: false });
  }

  let k = db.keys[key];

  if (k.blacklisted) return res.json({ valid: false });
  if (k.used && k.user !== user) return res.json({ valid: false });
  if (k.expires && Date.now() > k.expires) return res.json({ valid: false });

  k.used = true;
  k.user = user;

  saveDB(db);

  res.json({ valid: true });
});

app.listen(PORT, () => {
  console.log("API rodando 🚀");
});
