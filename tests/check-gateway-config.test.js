// Integration test for tools/check-gateway-config.cjs against the live gateway.
// Requires the YouPI gateway (payment API + checkout on localhost) to be running.
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const TOOL = path.join(__dirname, "../tools/check-gateway-config.cjs");

test("check-gateway-config inspects the live gateway and emits the SRI hash", () => {
  const r = spawnSync(process.execPath, [TOOL], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const out = r.stdout + r.stderr;
  assert.match(out, /SRI/);
  assert.match(out, /NEXT_PUBLIC_YOUPI_SCRIPT_INTEGRITY/);
  assert.match(out, /youpi.js status: 200/);
});
