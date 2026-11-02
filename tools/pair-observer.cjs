#!/usr/bin/env node
// Pair a simulated Android SMS observer with the local YouPI gateway and keep
// its heartbeat fresh, so the gateway accepts new UPI sessions ("UPI observers
// are offline" 503 goes away). Loads ANDROID_ENROLLMENT_SECRET from youpi-pg/.env.
const fs = require("node:fs");
const path = require("node:path");

function loadEnv(dir) {
  const env = {};
  const p = path.join(dir, ".env");
  if (!fs.existsSync(p)) return env;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const gwEnv = loadEnv(path.join(process.cwd(), "youpi-pg"));
const secret = process.env.ANDROID_ENROLLMENT_SECRET || gwEnv.ANDROID_ENROLLMENT_SECRET || "";
if (!secret) {
  console.error("FAIL: ANDROID_ENROLLMENT_SECRET not found in youpi-pg/.env");
  process.exit(1);
}

const API = process.env.BASE_PAYMENT_API_URL || "http://localhost:6100";

(async () => {
  // Pair
  const pairRes = await fetch(`${API}/api/v1/pollers/android/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enrollmentToken: secret,
      deviceName: "Local-Sim-Device",
      deviceModel: "CI/Local",
      merchantId: "00000000-0000-0000-0000-000000000001",
    }),
  });
  const pair = await pairRes.json().catch(() => ({}));
  if (!pairRes.ok) {
    console.error("FAIL: pairing ->", pairRes.status, JSON.stringify(pair));
    process.exit(1);
  }
  const deviceId = pair.deviceId;
  console.log("OK: paired device", deviceId);

  // Send heartbeat immediately, then every 60s.
  const beat = async () => {
    const r = await fetch(`${API}/api/v1/pollers/android/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
      body: JSON.stringify({ deviceId, timestamp: Date.now() }),
    });
    const b = await r.json().catch(() => ({}));
    console.log("heartbeat ->", r.status, JSON.stringify(b));
  };
  await beat();
  setInterval(beat, 60000);
  console.log("Heartbeat loop running (every 60s). Ctrl+C to stop.");
})();
