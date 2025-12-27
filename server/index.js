import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({
  contentSecurityPolicy: false, // keep simple for static site; tighten later
}));
app.use(express.json({ limit: "200kb" }));

// DB init
const dbPath = path.join(__dirname, "db", "mygym.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS coach_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  years_experience TEXT,
  specialties TEXT,
  link TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);
`);

function isValidEmail(email){
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Analytics stub endpoint (optional)
app.post("/api/event", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/waitlist", (req, res) => {
  const { email, source, company } = req.body || {};
  // honeypot
  if (company && String(company).trim().length > 0) return res.json({ ok: true });

  if (!isValidEmail(email)) return res.status(400).json({ error: "Please enter a valid email." });

  const now = new Date().toISOString();
  try{
    const stmt = db.prepare("INSERT OR IGNORE INTO waitlist (email, source, created_at) VALUES (?, ?, ?)");
    stmt.run(email.trim().toLowerCase(), (source||"website").slice(0,64), now);
    return res.json({ ok: true });
  }catch(e){
    return res.status(500).json({ error: "Unable to save email." });
  }
});

app.post("/api/coach-apply", (req, res) => {
  const {
    name, email, years_experience, specialties, link, note, company
  } = req.body || {};
  // honeypot
  if (company && String(company).trim().length > 0) return res.json({ ok: true });

  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Please enter a valid email." });

  const now = new Date().toISOString();
  try{
    const stmt = db.prepare(`
      INSERT INTO coach_applications (name, email, years_experience, specialties, link, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      String(name).trim().slice(0,120),
      String(email).trim().toLowerCase().slice(0,160),
      (years_experience||"").toString().slice(0,60),
      (specialties||"").toString().slice(0,220),
      (link||"").toString().slice(0,220),
      (note||"").toString().slice(0,1200),
      now
    );
    return res.json({ ok: true });
  }catch(e){
    return res.status(500).json({ error: "Unable to submit application." });
  }
});

// Serve static site
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MyGym.AI site running on http://localhost:${port}`);
});