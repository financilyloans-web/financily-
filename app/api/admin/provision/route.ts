import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/staff";

/**
 * Roles that may be created via this self-serve admin API. Admin accounts are
 * deliberately excluded: an admin must never be able to mint additional admin
 * privileges from the web panel (a compromised admin would otherwise be able
 * to escalate indefinitely). Admins are provisioned exclusively via the
 * high-assurance CLI (`tools/provision-staff.cjs`, requires a service-account
 * key) or the Firebase console.
 */
const VALID_ROLES: StaffRole[] = ["agent", "employee"];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * POST /api/admin/provision
 * Creates (or updates) an internal staff account: a Firebase Auth user
 * (email + password) plus the corresponding `staff/<email>` roster document.
 *
 * The caller must present a valid Firebase ID token for a user whose roster
 * role is `admin`. This keeps provisioning server-only — the browser can
 * never create arbitrary auth users.
 */
export async function POST(req: NextRequest) {
  let caller: { email?: string | null; role?: string } | null = null;

  try {
    // 1. Verify the caller's ID token.
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const decoded = await adminAuth().verifyIdToken(token);
    const callerEmail = normalizeEmail(decoded.email ?? "");
    if (!callerEmail) {
      return NextResponse.json({ error: "Token has no email claim." }, { status: 401 });
    }

    // 2. Require the caller to be an admin.
    const callerDoc = await adminDb().collection("staff").doc(callerEmail).get();
    const callerRole = callerDoc.exists ? callerDoc.data()?.role : undefined;
    if (callerRole !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    caller = { email: callerEmail, role: callerRole };

    // 3. Parse + validate the payload.
    let body: { email?: unknown; password?: unknown; role?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    const password = typeof body.password === "string" ? body.password : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid work email is required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role as StaffRole)) {
      return NextResponse.json({ error: "Role must be agent or employee." }, { status: 400 });
    }

    // 4. Create the auth user (create-only — we never modify an existing
    //     account's password here). This deliberately closes a privilege-
    //     escalation vector: an existing authenticated user's password must
    //     never be reset by this endpoint, and the caller must never be able
    //     to take over another account via a silent `updateUser` call.
    let uid: string;
    try {
      const u = await adminAuth().createUser({ email, password });
      uid = u.uid;
    } catch (err: any) {
      if (err?.code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "An account with this email already exists. Reset its password through the dedicated password-reset flow instead of recreating it." },
          { status: 409 },
        );
      }
      throw err;
    }

    // 5. Upsert the roster document (source of truth).
    await adminDb().collection("staff").doc(email).set({ role }, { merge: true });

    return NextResponse.json({
      ok: true,
      uid,
      email,
      role,
      roleLabel: STAFF_ROLE_LABELS[role as StaffRole],
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[admin/provision] error:", err);
    return NextResponse.json(
      { error: err?.message || "Provisioning failed." },
      { status: 500 },
    );
  }
}
