// Regression tests for the EMI payment routes.
//
// The core security contract these guard:
//  1. API responses are always JSON — never HTML (which used to throw
//     "Unexpected token '<', \"<!DOCTYPE ... is not valid JSON").
//  2. The public order endpoint must NOT leak borrower PII: the orderId is a
//     random bearer token (`EMI-<payToken>`), never the mobile number. A
//     mobile-derived orderId must be rejected.
const { test } = require("node:test");
const assert = require("node:assert");

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  assert.match(text, /^\{/, `expected JSON, got non-JSON body: ${text.slice(0, 120)}`);
  return { res, data: JSON.parse(text) };
}

test("admin/emi POST returns JSON (even when unauthorized)", async () => {
  const res = await fetch(`${BASE}/api/admin/emi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: "9812345670", amount: 5000, eligible: true }),
  });
  const text = await res.text();
  assert.match(text, /^\{/, `expected JSON, got HTML-ish body: ${text.slice(0, 120)}`);
  const data = JSON.parse(text);
  assert.ok("error" in data, "unauthenticated request should be rejected");
});

test("admin/emi GET returns JSON (even when unauthorized)", async () => {
  const { data } = await getJson(`${BASE}/api/admin/emi?mobile=9812345670`);
  assert.ok("error" in data, "unauthenticated request should be rejected");
});

test("youpi-order GET ?mobile= returns JSON and does NOT echo the mobile", async () => {
  const { data } = await getJson(`${BASE}/api/payments/youpi-order?mobile=9812345670`);
  // Response must never contain the mobile number (PII), even in error payloads.
  assert.ok(!JSON.stringify(data).includes("9812345670"), "response leaked mobile number");
  assert.ok("error" in data, "no EMI enabled for this number; should be an error");
});

test("youpi-order rejects a mobile-derived orderId (no PII in orderId)", async () => {
  const { res, data } = await getJson(`${BASE}/api/payments/youpi-order?orderId=EMI-9812345670`);
  assert.strictEqual(res.status, 400, "mobile-derived orderId must be rejected");
  assert.ok(data.error, "expected an error message");
});

test("youpi-order accepts a token-shaped orderId (returns JSON)", async () => {
  const { res } = await getJson(`${BASE}/api/payments/youpi-order?orderId=EMI-${"a".repeat(32)}`);
  // A well-formed token is resolved (or 404 if unknown) — but never a 400.
  assert.ok(res.status === 404 || res.status === 200, `unexpected status ${res.status}`);
});
