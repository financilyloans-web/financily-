#!/usr/bin/env node
/**
 * Provision (or update) a Financily internal staff member.
 *
 * Writes a document to the Firestore `staff` collection keyed by the
 * normalized email (doc id == email). This is the ONLY supported layout —
 * the Firestore rules and `lib/staff.ts` both key on the exact lowercase
 * email. See firestore.rules (staffDocNamed).
 *
 * REQUIREMENTS — a Firebase service-account key (Admin SDK). This is nothing
 * the app itself can do, because the `staff` collection is admin-write-only
 * (`allow write: if false`).
 *
 *   Get a key: Firebase Console → Project settings → Service accounts →
 *   "Generate new private key" → you get a JSON file. Save it as
 *   `staff/service-account.json`. **Never commit this file** (it is already
 *   gitignored).
 *
 * USAGE
 *   node tools/provision-staff.cjs <email> [agent|employee]
 *     default role: employee
 *
 *   Environment override for the key path:
 *     SERVICE_ACCOUNT_PATH=path/to/key.json node tools/provision-staff.cjs ...
 *
 * EXAMPLES
 *   node tools/provision-staff.cjs sobtruby6@gmail.com employee
 *   node tools/provision-staff.cjs field@financily.in agent
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const EMAIL = process.argv[2];
const ROLE = (process.argv[3] || "employee").toLowerCase();
const PASSWORD = process.env.STAFF_PASSWORD || process.argv[4] || "";

const VALID_ROLES = new Set(["agent", "employee", "admin"]);

const KEY_PATH =
  process.env.SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "..", "staff", "service-account.json");

function fail(msg) {
  process.stderr.write(`✖ ${msg}\n`);
  process.exit(1);
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

async function main() {
  if (!EMAIL) {
    fail('Usage: node tools/provision-staff.cjs <email> [agent|employee]');
  }
  if (!VALID_ROLES.has(ROLE)) {
    fail(`Role must be "agent", "employee" or "admin" (got "${ROLE}").`);
  }
  if (!fs.existsSync(KEY_PATH)) {
    fail(
      `Service-account key not found at ${KEY_PATH}.\n` +
        "  Add it (Download from Firebase Console → Project settings → Service accounts → Generate new private key).\n" +
        "  Or set SERVICE_ACCOUNT_PATH=/path/to/key.json",
    );
  }

  const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));
  const projectId = serviceAccount.project_id;

  if (admin.getApps().length === 0) {
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
      projectId,
      databaseURL: undefined,
    });
  }

  const db = getFirestore(admin.getApps()[0]);

  const email = normalizeEmail(EMAIL);
  const role = ROLE;

  // 1. Upsert the staff doc (the source of truth).
  const staffRef = db.collection("staff").doc(email);
  await staffRef.set({ role }, { merge: false });

  // 2. Verify the write landed and is readable.
  const snap = await staffRef.get();
  if (!snap.exists) {
    fail(`Provisioned but could not re-read staff/${email}.`);
  }
  const data = snap.data();

  // 3. Optionally create/update the Firebase Auth user (email + password).
  //     Without this, the staff member has a roster entry but no login
  //     credential. Required for the account to actually sign in.
  if (PASSWORD) {
    if (PASSWORD.length < 6) {
      fail("Password must be at least 6 characters.");
    }
    const auth = getAuth(admin.getApps()[0]);
    let uid = null;
    try {
      const u = await auth.getUserByEmail(email);
      uid = u.uid;
      await auth.updateUser(uid, { password: PASSWORD });
      console.log(`✔ Auth user found — password updated (${email})`);
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        const u = await auth.createUser({ email, password: PASSWORD });
        uid = u.uid;
        console.log(`✔ Auth user created (${email})`);
      } else {
        throw e;
      }
    }
    console.log(`  Auth UID : ${uid}`);
  } else {
    console.log(`⚠ No STAFF_PASSWORD set — Auth user NOT created (login unavailable).`);
  }

  console.log(`✔ Provisioned staff member`);
  console.log(`  Document : staff/${email}`);
  console.log(`  Role     : ${data.role}`);
  console.log(`  Project  : ${projectId}`);
  console.log(`\nThey can now sign in using role "${data.role}" ${
    data.role === "admin" ? "at /admin-login" : "at /staff-login"
  }.`);
}

main().catch((err) => {
  // Surface the full error for diagnosis (not just err.message).
  fail(
    (err && err.stack ? err.stack : err && err.message ? err.message : String(err)) +
      "\n",
  );
});
