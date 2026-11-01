import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * GET /api/payments/youpi-order?orderId=EMI-LN-2026-8492
 *
 * Authoritative order resolution for the YouPI checkout.
 *
 * The Pay-EMI UI receives orderId/amount from React props. A malicious or
 * tampered page could pass a wrong amount or orderId. To prevent charging the
 * wrong amount for the wrong order, the client must resolve the order here
 * FIRST, and only call Youpi.pay with the amount/orderId this endpoint returns.
 *
 * The route is authenticated (Firebase ID token). It reads the caller's stored
 * loan application from Firestore (admin SDK) and recomputes the EMI amount
 * from the authoritative loanAmount — never from client inputs.
 */
export async function GET(req: NextRequest) {
  // 1. Authenticate the caller.
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired authorization token." }, { status: 401 });
  }

  // 2. Read + validate orderId (expected format: EMI-<refNumber|docId>).
  const orderId = (req.nextUrl.searchParams.get("orderId") || "").trim();
  if (!orderId.startsWith("EMI-")) {
    return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
  }
  const ref = orderId.slice("EMI-".length);

  // 3. Look up the caller's applications for the matching ref/document.
  try {
    const snapshot = await adminDb()
      .collection("users")
      .doc(uid)
      .collection("applications")
      .get();

    let match: QueryDocumentSnapshot | undefined;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const key = data?.refNumber || doc.id;
      if (key === ref) match = doc;
    });

    if (!match) {
      return NextResponse.json({ error: "Order not found for this account." }, { status: 404 });
    }

    const data = match.data();
    const loanAmount = Number(data?.loanAmount);
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return NextResponse.json({ error: "Order has no valid amount." }, { status: 409 });
    }

    // Authoritative EMI amount — same formula the dashboard uses, recomputed
    // server-side from the stored loanAmount.
    const amount = Math.round(loanAmount / 12);

    return NextResponse.json({
      orderId: `EMI-${data?.refNumber || match.id}`,
      amount,
      refNumber: data?.refNumber || match.id,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[payments/youpi-order] error:", err);
    return NextResponse.json({ error: "Could not resolve order." }, { status: 500 });
  }
}
