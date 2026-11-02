// Provision the YouPI gateway DB with the merchant's real account details.
//
// Safety: this script updates EXISTING seeded rows. It refuses to run if the
// database file is missing or has not been migrated, and it verifies each UPDATE
// actually touched a row (via statementResult.changes) before reporting success.
// Run `npm run db:setup` inside youpi-pg first if the DB does not exist yet.

const fs = require("node:fs");
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

const MERCHANT_ID = "00000000-0000-0000-0000-000000000001";
const ACCOUNT_ID = "00000000-0000-0000-0000-000000000002";

// Contact/account values come from the environment so real details are never
// committed to source control. Defaults are explicit, obviously-non-real
// placeholders. Set the FINANCILY_* vars to apply real account details.
const MERCHANT_NAME = process.env.FINANCILY_MERCHANT_NAME || "Financily";
const SUPPORT_EMAIL = process.env.FINANCILY_SUPPORT_EMAIL || "support@example.in";
const SUPPORT_PHONE = process.env.FINANCILY_SUPPORT_PHONE || "0000000000";

const UPI_ID = process.env.FINANCILY_UPI_ID || "merchant@upi";
const PAYEE_NAME = process.env.FINANCILY_PAYEE_NAME || "Financily";

const dbPath = process.env.GATEWAY_DB_PATH
  ? path.resolve(process.env.GATEWAY_DB_PATH)
  : path.resolve(__dirname, "../youpi-pg/data/youpi_pg.sqlite");

function fail(msg) {
  console.error(`[-] ${msg}`);
  process.exit(1);
}

// 1. The file must already exist. Never create an empty DB implicitly.
if (!fs.existsSync(dbPath)) {
  fail(
    `Gateway database not found at ${dbPath}\n` +
      `    Provisioning only updates an existing, migrated database.\n` +
      "    Run 'npm run db:setup' inside youpi-pg first, then re-run this script.",
  );
}

const db = new DatabaseSync(dbPath);

// 2. The DB must be migrated (merchants table present).
try {
  const row = db
    .prepare(
      "SELECT count(*) AS count FROM sqlite_master WHERE type='table' AND name='merchants'",
    )
    .get();
  if (!row || Number(row.count) === 0) {
    db.close();
    fail(
      "'merchants' table not found — the database exists but is not migrated.\n" +
        "    Run 'npm run db:setup' inside youpi-pg first, then re-run this script.",
    );
  }
} catch (err) {
  db.close();
  fail(`Could not inspect database: ${err.message}`);
}

const now = new Date().toISOString();

// 3. Update merchant, checking that exactly the expected row changed.
const merchantRes = db
  .prepare(
    "UPDATE merchants SET business_name = ?, contact_email = ?, contact_phone = ?, updated_at = ? WHERE id = ?",
  )
  .run(MERCHANT_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, now, MERCHANT_ID);

if (Number(merchantRes.changes) < 1) {
  db.close();
  fail(
    `Merchant update affected ${merchantRes.changes} row(s) — expected at least 1 ` +
      `(merchant ${MERCHANT_ID}). Is the DB seeded?`,
  );
}

// 4. Update receiving account, checking the same way.
const accountRes = db
  .prepare(
    "UPDATE payment_receiving_accounts SET upi_id = ?, payee_name = ?, updated_at = ? WHERE id = ?",
  )
  .run(UPI_ID, PAYEE_NAME, now, ACCOUNT_ID);

if (Number(accountRes.changes) < 1) {
  db.close();
  fail(
    `Receiving account update affected ${accountRes.changes} row(s) — expected at least 1 ` +
      `(account ${ACCOUNT_ID}). Is the DB seeded?`,
  );
}

db.close();

console.log("[✓] Provisioned merchant:", MERCHANT_NAME);
console.log("[✓] Provisioned receiving account:", UPI_ID, `(${PAYEE_NAME})`);
