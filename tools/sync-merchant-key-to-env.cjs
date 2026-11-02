// One-off helper: copy the rotated merchant key (from the gitignored secrets
// file) into .env.local's YOUPI_MERCHANT_API_KEY line. Never prints the secret.
const fs = require("node:fs");
const path = require("node:path");

const keyFile = path.resolve(__dirname, "../youpi-pg/data/.secrets/merchant_api_key");
const envFile = path.resolve(__dirname, "../.env.local");

if (!fs.existsSync(keyFile)) {
  console.error("[-] merchant_api_key file not found. Run tools/rotate-merchant-key.cjs first.");
  process.exit(1);
}
const key = fs.readFileSync(keyFile, "utf8").trim();
if (!key) {
  console.error("[-] merchant_api_key file is empty.");
  process.exit(1);
}

let env = fs.readFileSync(envFile, "utf8");
env = env.replace(/^YOUPI_MERCHANT_API_KEY=.*$/m, `YOUPI_MERCHANT_API_KEY=${key}`);
if (!/YOUPI_MERCHANT_API_KEY=/.test(env)) {
  env += `\nYOUPI_MERCHANT_API_KEY=${key}\n`;
}
fs.writeFileSync(envFile, env);

console.log("[✓] .env.local YOUPI_MERCHANT_API_KEY synced from secrets file (value not shown).");
