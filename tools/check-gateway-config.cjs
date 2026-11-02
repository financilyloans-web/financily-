const { DatabaseSync } = require("node:sqlite");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MERCHANT_ID = "00000000-0000-0000-0000-000000000001";
const CHECKOUT_URL = "http://localhost:7000";

// 1. Merchant API key / webhook secret candidates
const secretsDir = path.resolve(__dirname, "../youpi-pg/data/.secrets");
const candidates = [];
for (const f of fs.readdirSync(secretsDir)) {
  if (/hook_secret|_key$/.test(f)) {
    candidates.push({ file: f, value: fs.readFileSync(path.join(secretsDir, f), "utf8").trim() });
  }
}

// 2. Compare against the DB api_key_hash
const dbPath = path.resolve(__dirname, "../youpi-pg/data/youpi_pg.sqlite");
const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT api_key_hash FROM merchants WHERE id = ?").get(MERCHANT_ID);
db.close();

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
console.log("Merchant id:", MERCHANT_ID);
console.log("api_key_hash in DB:", row && row.api_key_hash ? row.api_key_hash : "(null)");

let matched = null;
for (const c of candidates) {
  const h = hash(c.value);
  const ok = row && row.api_key_hash && h === row.api_key_hash;
  console.log(`  candidate ${c.file}: match=${ok}`);
  if (ok) matched = c.value;
}
console.log("\nMerchant key (NEXT_PUBLIC_YOUPI_PUBLIC_KEY):", matched ? matched : "NO MATCH — need to rotate key");

// 3. Compute SRI hash of /youpi.js
const sha384b64 = (buf) => crypto.createHash("sha384").update(buf).digest("base64");
http
  .get(`${CHECKOUT_URL}/youpi.js`, (res) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => {
      const body = Buffer.concat(chunks);
      console.log("\nCheckout URL:", CHECKOUT_URL);
      console.log("youpi.js status:", res.statusCode, "bytes:", body.length);
      console.log("SRI (NEXT_PUBLIC_YOUPI_SCRIPT_INTEGRITY):", `sha384-${sha384b64(body)}`);
    });
  })
  .on("error", (e) => {
    console.error("\nFailed to fetch youpi.js:", e.message);
  });
