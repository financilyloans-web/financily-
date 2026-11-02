import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Require the caller to present a valid Firebase ID token for an admin
 * provisioned in the internal `staff` roster. Returns an error response when
 * unauthorized, or null when allowed.
 */
async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const email = normalizeEmail(decoded.email ?? "");
    if (!email) {
      return NextResponse.json({ error: "Token has no email claim." }, { status: 401 });
    }
    const doc = await adminDb().collection("staff").doc(email).get();
    if (!doc.exists || doc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }
}

const MOBILE_RE = /^[6-9]\d{9}$/;

/**
 * POST /api/admin/emi   body: { mobile, amount?, eligible }
 * Enables/disables EMI payment for every active (non-rejected) application
 * registered to the given mobile number, and sets the exact amount payable.
 * This is the admin's authoritative control over who can pay and how much.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { mobile?: unknown; amount?: unknown; eligible?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const mobile = String(body.mobile ?? "").trim();
  if (!MOBILE_RE.test(mobile)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number." },
      { status: 400 },
    );
  }

  const eligible = body.eligible === true;
  const amount = Number(body.amount);
  if (eligible && (!Number.isFinite(amount) || amount <= 0)) {
    return NextResponse.json(
      { error: "Provide a valid EMI amount when enabling payment." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await adminDb().collectionGroup("applications").get();

    let updated = 0;
    const batch = adminDb().batch();
    snapshot.forEach((d) => {
      if (d.data()?.mobile !== mobile) return;
      if (d.data()?.status === "rejected") return;
      batch.update(d.ref, {
        emiEligible: eligible,
        emiAmount: eligible ? Math.round(amount) : null,
      });
      updated++;
    });

    if (updated > 0) await batch.commit();

    return NextResponse.json({
      ok: true,
      updated,
      eligible,
      amount: eligible ? Math.round(amount) : null,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[admin/emi] error:", err);
    return NextResponse.json(
      { error: err?.message || "Could not update EMI payment settings." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/emi?mobile=...
 * Lists the applications registered to a mobile number with their current EMI
 * payment status, for the admin to review before enabling payment.
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const mobile = (req.nextUrl.searchParams.get("mobile") || "").trim();
  if (!MOBILE_RE.test(mobile)) {
    return NextResponse.json({ applications: [] });
  }

  try {
    const snapshot = await adminDb().collectionGroup("applications").get();

    const applications = snapshot.docs
      .filter((d) => d.data()?.mobile === mobile)
      .map((d) => {
      const x = d.data();
      return {
        id: d.id,
        uid: x.uid,
        fullName: x.fullName || "—",
        status: x.status || "—",
        loanAmount: x.loanAmount ?? null,
        emiEligible: x.emiEligible === true,
        emiAmount: x.emiAmount ?? null,
      };
    });

    return NextResponse.json({ applications });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[admin/emi] lookup error:", err);
    return NextResponse.json(
      { error: err?.message || "Could not look up applications." },
      { status: 500 },
    );
  }
}
