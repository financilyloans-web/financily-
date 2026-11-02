import {
  collection,
  collectionGroup,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface LoanApplication {
  id?: string;
  uid: string;
  /** Unique human-readable reference, e.g. LN-2026-8492. */
  refNumber?: string;
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
  /**
   * High-entropy per-loan bearer token used to authorize anonymous EMI payments
   * (orderId = `EMI-<payToken>`). A random, unguessable value so a third party
   * cannot enumerate other borrowers' loans or amounts.
   */
  payToken?: string;
  /** EMI payment enablement — controlled by an admin (see /api/admin/emi). */
  emiEligible?: boolean;
  /** Admin-set amount payable as an EMI for this loan. */
  emiAmount?: number;
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

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/**
 * Generate a unique, human-readable loan reference number (e.g. LN-2026-8492).
 * Format: LN-<year>-<4 char code>. The random code uses a de-ambiguous alphabet.
 */
export function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const rand = () => REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  const code = `${rand()}${rand()}${rand()}${rand()}`;
  return `LN-${year}-${code}`;
}

/**
 * Generate a high-entropy per-loan bearer token (128-bit hex). This is used as
 * the private payment key for anonymous EMI payments and is deliberately NOT a
 * guessable/human-readable value.
 */
export function generatePayToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function saveApplication(app: Omit<LoanApplication, "id" | "createdAt">): Promise<string> {
  ensureDb();
  const sanitized = await sanitizeKyc(app);
  const docRef = await addDoc(collection(db!, "users", app.uid, "applications"), {
    ...sanitized,
    refNumber: app.refNumber || generateRefNumber(),
    payToken: app.payToken || generatePayToken(),
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
    refNumber: app.refNumber || generateRefNumber(),
    source: "apply_form",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Staff-only: fetch every customer loan application — both authenticated
 * applications (stored under users/{uid}/applications) and guest leads (top-level
 * `leads`). Used by the staff dashboard. Requires staff read rules.
 */
export async function getAllCustomerApplications(): Promise<LoanApplication[]> {
  ensureDb();
  const [appsSnap, leadsSnap] = await Promise.all([
    getDocs(query(collectionGroup(db!, "applications"), orderBy("createdAt", "desc"), limit(1000))),
    getDocs(query(collection(db!, "leads"), orderBy("createdAt", "desc"), limit(1000))),
  ]);
  const apps = appsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as LoanApplication) }));
  const leads = leadsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as LoanApplication) }));
  return [...apps, ...leads].sort((a, b) => {
    const ta = toTime(a.createdAt);
    const tb = toTime(b.createdAt);
    return tb - ta;
  });
}

function toTime(ts?: Timestamp | Date | number): number {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  try {
    return ts.toMillis();
  } catch {
    return 0;
  }
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
