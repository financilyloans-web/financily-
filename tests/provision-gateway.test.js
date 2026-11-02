// Integration tests for tools/provision-gateway.cjs (Node's built-in test runner).
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const TOOL = path.join(__dirname, "../tools/provision-gateway.cjs");

function run(env) {
  return spawnSync(process.execPath, [TOOL], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

test("provision-gateway refuses a missing DB file (exit 1)", () => {
  const missing = path.join(__dirname, "definitely-missing.sqlite");
  const r = run({ GATEWAY_DB_PATH: missing });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /not found/i);
});

test("provision-gateway refuses an unmigrated (empty) DB", () => {
  const emptyDb = path.join(__dirname, "tmp_empty_pp.sqlite");
  try { fs.unlinkSync(emptyDb); } catch {}
  new DatabaseSync(emptyDb).close(); // empty file => no merchants table
  try {
    const r = run({ GATEWAY_DB_PATH: emptyDb });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr + r.stdout, /merchants' table not found/i);
  } finally {
    try { fs.unlinkSync(emptyDb); } catch {}
  }
});

test("provision-gateway updates a seeded DB with the receiver details", () => {
  const dbPath = path.join(__dirname, "tmp_seeded_pp.sqlite");
  try { fs.unlinkSync(dbPath); } catch {}
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE merchants (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      webhook_url TEXT,
      webhook_secret TEXT NOT NULL,
      api_key_hash TEXT,
      branding TEXT NOT NULL DEFAULT '{}',
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE payment_receiving_accounts (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      upi_id TEXT NOT NULL,
      payee_name TEXT NOT NULL,
      is_merchant_enabled INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_slot_busy INTEGER NOT NULL DEFAULT 0,
      current_active_session_id TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);
  const now = "2024-01-01T00:00:00.000Z";
  db.prepare(
    "INSERT INTO merchants (id,business_name,slug,contact_email,contact_phone,webhook_secret,branding,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).run("00000000-0000-0000-0000-000000000001", "Dummy", "demo", "a@b.c", "123", "secret", "{}", now, now);
  db.prepare(
    "INSERT INTO payment_receiving_accounts (id,merchant_id,upi_id,payee_name,created_at,updated_at) VALUES (?,?,?,?,?,?)",
  ).run("00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000001", "merchant@upi", "Dummy", now, now);
  db.close();

  try {
    const r = run({
      GATEWAY_DB_PATH: dbPath,
      FINANCILY_MERCHANT_NAME: "Financily",
      FINANCILY_SUPPORT_EMAIL: "support@financily.in",
      FINANCILY_SUPPORT_PHONE: "+919876543210",
      FINANCILY_UPI_ID: "8269581567-2@ybl",
      FINANCILY_PAYEE_NAME: "Good Life Enterprises",
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /Financily/);
    assert.match(r.stdout, /8269581567-2@ybl/);

    const check = new DatabaseSync(dbPath);
    const m = check.prepare("SELECT business_name FROM merchants WHERE id = ?").get("00000000-0000-0000-0000-000000000001");
    const a = check.prepare("SELECT upi_id, payee_name FROM payment_receiving_accounts WHERE id = ?").get("00000000-0000-0000-0000-000000000002");
    check.close();
    assert.equal(m.business_name, "Financily");
    assert.equal(a.upi_id, "8269581567-2@ybl");
    assert.equal(a.payee_name, "Good Life Enterprises");
  } finally {
    try { fs.unlinkSync(dbPath); } catch {}
  }
});
