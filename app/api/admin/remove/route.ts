import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * POST /api/admin/remove
 * Removes an internal staff member (agent or employee): deletes their
 * Firebase Auth user and their `staff/<email>` roster document.
 *
 * There: the authenticated caller must be an admin. Admins can never be
 * removed through this endpoint (preventing an admin from deleting other
 * admins or themselves via the web panel) — admin removal is intentionally a
 * high-assurance operation.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller is an admin.
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

    const callerDoc = await adminDb().collection("staff").doc(callerEmail).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // 2. Parse + validate the target email.
    let body: { email?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // 3. Never allow removing an admin (or the caller themselves).
    if (email === callerEmail) {
      return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 });
    }
    const targetDoc = await adminDb().collection("staff").doc(email).get();
    const targetRole = targetDoc.exists ? targetDoc.data()?.role : undefined;
    if (targetRole === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be removed through this portal." }, { status: 403 });
    }
    if (!targetDoc.exists) {
      return NextResponse.json({ error: "No staff account exists for this email." }, { status: 404 });
    }

    // 4. Delete the Auth user (resolve UID first; ignore if it doesn't exist)
    //    and the roster document.
    try {
      const existing = await adminAuth().getUserByEmail(email);
      await adminAuth().deleteUser(existing.uid);
    } catch (err: any) {
      // Do not fail if the auth user is already gone.
      if (err?.code !== "auth/user-not-found") throw err;
    }
    await adminDb().collection("staff").doc(email).delete();

    return NextResponse.json({ ok: true, email, role: targetRole });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[admin/remove] error:", err);
    return NextResponse.json(
      { error: err?.message || "Removal failed." },
      { status: 500 },
    );
  }
}
