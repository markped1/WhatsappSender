import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let db: Database;
const dbPath = path.join(app.getPath('userData'), 'whatsapp_bulk.sqlite');

export async function initDatabase() {
  const wasmPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
    : path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');

  try {
    const SQL = await initSqlJs({ locateFile: (f: string) => f === 'sql-wasm.wasm' ? wasmPath : f });
    if (fs.existsSync(dbPath)) {
      db = new SQL.Database(fs.readFileSync(dbPath));
    } else {
      db = new SQL.Database();
    }
    createTables();
    saveDatabase();
    console.log('[DB] Ready');
  } catch (err: any) {
    console.error('[DB] Failed:', err.message);
    throw err;
  }
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE, name TEXT,
    status TEXT DEFAULT 'pending',
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT,
    total_contacts INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    last_sent_phone TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    campaign_name TEXT,
    phone TEXT,
    status TEXT,
    error TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    reason TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

export function saveDatabase() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function toRows(res: any[]) {
  if (res.length === 0) return [];
  const cols = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: Record<string, any> = {};
    cols.forEach((c: string, i: number) => obj[c] = row[i]);
    return obj;
  });
}

// ── Contacts ──
export function addContacts(contacts: { phone: string; name?: string }[]) {
  const stmt = db.prepare('INSERT OR IGNORE INTO contacts (phone, name) VALUES (?, ?)');
  for (const c of contacts) stmt.run([c.phone, c.name || null]);
  stmt.free();
  saveDatabase();
}

export function getContacts() {
  return toRows(db.exec('SELECT * FROM contacts ORDER BY added_at DESC'));
}

export function updateContactStatus(phone: string, status: string) {
  db.run('UPDATE contacts SET status = ? WHERE phone = ?', [status, phone]);
  saveDatabase();
}

export function clearContacts() {
  db.run('DELETE FROM contacts');
  saveDatabase();
}

// ── Campaigns ──
export function createCampaign(name: string, message: string, totalContacts: number): number {
  db.run('INSERT INTO campaigns (name, message, total_contacts) VALUES (?, ?, ?)', [name, message, totalContacts]);
  const res = db.exec('SELECT last_insert_rowid() as id');
  saveDatabase();
  return res[0].values[0][0] as number;
}

export function getCampaigns() {
  return toRows(db.exec('SELECT * FROM campaigns ORDER BY created_at DESC'));
}

export function updateCampaign(id: number, data: { sentCount?: number; failedCount?: number; status?: string; lastSentPhone?: string; completedAt?: string }) {
  const parts: string[] = [];
  const vals: any[] = [];
  if (data.sentCount !== undefined) { parts.push('sent_count = ?'); vals.push(data.sentCount); }
  if (data.failedCount !== undefined) { parts.push('failed_count = ?'); vals.push(data.failedCount); }
  if (data.status !== undefined) { parts.push('status = ?'); vals.push(data.status); }
  if (data.lastSentPhone !== undefined) { parts.push('last_sent_phone = ?'); vals.push(data.lastSentPhone); }
  if (data.completedAt !== undefined) { parts.push('completed_at = ?'); vals.push(data.completedAt); }
  if (parts.length === 0) return;
  vals.push(id);
  db.run(`UPDATE campaigns SET ${parts.join(', ')} WHERE id = ?`, vals);
  saveDatabase();
}

export function deleteCampaign(id: number) {
  db.run('DELETE FROM logs WHERE campaign_id = ?', [id]);
  db.run('DELETE FROM campaigns WHERE id = ?', [id]);
  saveDatabase();
}

// ── Logs ──
export function addLog(campaignId: number, campaignName: string, phone: string, status: string, error?: string) {
  db.run('INSERT INTO logs (campaign_id, campaign_name, phone, status, error) VALUES (?, ?, ?, ?, ?)',
    [campaignId, campaignName, phone, status, error || null]);
  saveDatabase();
}

export function getLogs(campaignId?: number) {
  const sql = campaignId
    ? 'SELECT * FROM logs WHERE campaign_id = ? ORDER BY timestamp DESC LIMIT 500'
    : 'SELECT * FROM logs ORDER BY timestamp DESC LIMIT 500';
  return toRows(db.exec(sql, campaignId ? [campaignId] : []));
}

export function clearLogs() {
  db.run('DELETE FROM logs');
  saveDatabase();
}

// ── Blacklist ──
export function addToBlacklist(phones: string[], reason = 'manual') {
  const stmt = db.prepare('INSERT OR IGNORE INTO blacklist (phone, reason) VALUES (?, ?)');
  for (const p of phones) stmt.run([p, reason]);
  stmt.free();
  saveDatabase();
}

export function getBlacklist(): string[] {
  const res = toRows(db.exec('SELECT phone FROM blacklist'));
  return res.map((r: any) => r.phone);
}

export function removeFromBlacklist(phone: string) {
  db.run('DELETE FROM blacklist WHERE phone = ?', [phone]);
  saveDatabase();
}

export function clearBlacklist() {
  db.run('DELETE FROM blacklist');
  saveDatabase();
}

// ── Templates ──
export function saveTemplate(name: string, message: string) {
  db.run('INSERT INTO templates (name, message) VALUES (?, ?)', [name, message]);
  saveDatabase();
}

export function getTemplates() {
  return toRows(db.exec('SELECT * FROM templates ORDER BY created_at DESC'));
}

export function deleteTemplate(id: number) {
  db.run('DELETE FROM templates WHERE id = ?', [id]);
  saveDatabase();
}
