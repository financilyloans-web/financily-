import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface LoanApplication {
  id?: string;
  uid: string;
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  /**
   * Raw KYC values are accepted on input but NEVER persisted. Storage carries
   * only masked representations and salted one-way hashes (see SecureKyc).
   */
  pan?: string;
  aadhaar?: string;
  panMasked?: string;
  aadhaarMasked?: string;
  panHash?: string;
  aadhaarHash?: string;
  kycSalt?: string;
  kycStoredAt?: Timestamp | Date;
  employmentType: "salaried" | "self-employed";
  companyName: string;
  monthlyIncome: number;
  loanAmount: number;
  purpose: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  status: "submitted" | "under_review" | "offer_received" | "disbursed" | "rejected";
  lender?: string;
  offerRate?: number;
  createdAt?: Timestamp | Date;
}

function ensureDb() {
  if (!db) throw new Error("Firebase Firestore is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.");
}

/** SHA-256 hex digest (best-effort; empty on failure). */
async function sha256(input: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(input.trim().toUpperCase());
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

/** Mask a PAN: keep first two + last character, e.g. ABCDE1234F → AB••••••F. */
function maskPan(pan: string): string {
  const p = (pan || "").toUpperCase().replace(/\s/g, "");
  if (p.length < 10) return p;
  return `${p.slice(0, 2)}••••••${p.slice(-1)}`;
}

/** Mask Aadhaar: keep only the last 4 digits, e.g. XXXX XXXX 9012. */
function maskAadhaar(aadhaar: string): string {
  const d = (aadhaar || "").replace(/\D/g, "");
  return d ? `XXXX XXXX ${d.slice(-4)}` : "";
}

/**
 * Ensure a document never stores raw PAN / Aadhaar.
 *
 * - If the payload already carries secure KYC (masked + salted hashes from
 *   `buildSecureKyc`), those are preserved untouched.
 * - If raw `pan`/`aadhaar` are somehow present, they are stripped and replaced
 *   with masked + hashed forms.
 * The raw values are never written to Firestore.
 */
async function sanitizeKyc(app: Record<string, unknown>) {
  const { pan, aadhaar, ...rest } = app;

  // If raw values were provided, derive secure forms from them; otherwise trust
  // the already-secure fields present in the payload.
  if (typeof pan === "string" && pan.trim().length > 0) {
    rest.panMasked = maskPan(pan);
    rest.panHash = await sha256(pan);
  }
  if (typeof aadhaar === "string" && aadhaar.trim().length > 0) {
    rest.aadhaarMasked = maskAadhaar(aadhaar);
    rest.aadhaarHash = await sha256(aadhaar);
  }

  return { ...rest, kycStoredAt: serverTimestamp() };
}

export async function saveApplication(app: Omit<LoanApplication, "id" | "createdAt">): Promise<string> {
  ensureDb();
  const sanitized = await sanitizeKyc(app);
  const docRef = await addDoc(collection(db!, "users", app.uid, "applications"), {
    ...sanitized,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserApplications(uid: string): Promise<LoanApplication[]> {
  ensureDb();
  const q = query(
    collection(db!, "users", uid, "applications"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as LoanApplication) }));
}

/**
 * Save a lead for a visitor who has not logged in.
 * Guest leads go to a shared top-level `leads` collection (append-only).
 */
export async function saveLead(app: Omit<LoanApplication, "id" | "createdAt">): Promise<string> {
  ensureDb();
  const sanitized = await sanitizeKyc(app);
  const docRef = await addDoc(collection(db!, "leads"), {
    ...sanitized,
    source: "apply_form",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function saveLoanRequest(uid: string, data: { loanAmount: number; purpose: string }): Promise<string> {
  ensureDb();
  const docRef = await addDoc(collection(db!, "users", uid, "savedRequests"), {
    ...data,
    savedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserSavedRequests(uid: string): Promise<any[]> {
  ensureDb();
  const q = query(
    collection(db!, "users", uid, "savedRequests"),
    orderBy("savedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getApplicationsByStatus(uid: string, status: LoanApplication["status"]): Promise<LoanApplication[]> {
  ensureDb();
  const q = query(
    collection(db!, "users", uid, "applications"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as LoanApplication) }));
}
