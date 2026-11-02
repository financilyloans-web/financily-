// Rotate the YouPI merchant API key via the gateway admin API.
//
// Security: the newly generated key is NEVER logged to stdout. It is written to
// a gitignored secrets file with restrictive permissions (chmod 0600). The
// script prints only instructions and the public/publishable merchant id.
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MERCHANT_ID = "00000000-0000-0000-0000-000000000001";
const API = "http://localhost:6100";

const SECRETS_DIR = path.resolve(__dirname, "../youpi-pg/data/.secrets");
const KEY_FILE = path.join(SECRETS_DIR, "merchant_api_key");

const ADMIN_TOKEN = fs.readFileSync(path.join(SECRETS_DIR, "admin_api_token"), "utf8").trim();

const body = JSON.stringify({ merchantId: MERCHANT_ID });
const url = new URL(`${API}/api/v1/admin/merchant-key/rotate`);

function exitWith(msg, code) {
  console.error(msg);
  process.exitCode = code || 1;
}

const req = http.request(
  {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        return exitWith(`Rotation failed (HTTP ${res.statusCode}): non-JSON response.`);
      }

      if (res.statusCode !== 200 || !parsed.merchantKey) {
        return exitWith(`Rotation failed (HTTP ${res.statusCode}): ${parsed.error || parsed.message || "unknown error"}`);
      }

      // Persist the key to a gitignored file, never to stdout/logs.
      try {
        fs.mkdirSync(SECRETS_DIR, { recursive: true });
        fs.writeFileSync(KEY_FILE, parsed.merchantKey + "\n", { mode: 0o600 });
        try { fs.chmodSync(KEY_FILE, 0o600); } catch {}
      } catch (e) {
        return exitWith(`Could not write key file: ${e.message}`);
      }

      console.log("✓ Merchant API key rotated successfully.");
      console.log(`  Key written to ${KEY_FILE} (mode 0600, gitignored).`);
      console.log("  Set YOUPI_MERCHANT_API_KEY to the contents of that file.");
      console.log("  Do NOT log or commit the key value.");
      console.log(`  Publishable merchant ID (NEXT_PUBLIC_YOUPI_PUBLIC_KEY): ${parsed.publishableKey}`);
    });
  },
);

req.on("error", (e) => {
  exitWith(`Request error: ${e.message}`);
});
req.write(body);
req.end();
