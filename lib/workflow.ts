import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Staff case-management workflow — transferred from the SOLITAIRE underwriting
 * portal concept: a case queue with approve / rework / reject decisions and an
 * append-only audit trail (`workflow_history`). Adapted to Financily's Firestore
 * model. Staff case data lives in a top-level `cases` collection; every decision
 * is mirrored into `workflow_history` for a complete, searchable audit trail.
 */

export type CaseStatus =
  | "new"
  | "under_review"
  | "approved"
  | "rework"
  | "rejected";

export type CaseAction = "approve" | "rework" | "reject";

export interface CaseRecord {
  id?: string;
  applicationNo: string;
  customerName: string;
  mobile: string;
  email: string;
  loanType: string;
  loanAmount: number;
  purpose: string;
  city: string;
  state: string;
  status: CaseStatus;
  lender?: string;
  assignedBy?: string;
  assignedAt?: Timestamp | Date;
  reworkReason?: string;
  reworkBy?: string;
  decidedAt?: Timestamp | Date;
  decidedBy?: string;
  createdAt?: Timestamp | Date;
}

export interface WorkflowEvent {
  id?: string;
  applicationNo: string;
  action: string;
  oldStatus?: string;
  newStatus: string;
  remarks?: string;
  user?: string;
  role?: string;
  createdAt?: Timestamp | Date;
}

function ensureDb() {
  if (!db) throw new Error("Firebase Firestore is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.");
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  rework: "Rework",
  rejected: "Rejected",
};

export function caseStatusLabel(status: CaseStatus): string {
  return STATUS_LABEL[status] ?? status;
}

export async function listCases(): Promise<CaseRecord[]> {
  ensureDb();
  const q = query(collection(db!, "cases"), orderBy("createdAt", "desc"), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CaseRecord) }));
}

export async function getCasesByStatus(status: CaseStatus): Promise<CaseRecord[]> {
  ensureDb();
  const q = query(
    collection(db!, "cases"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(500),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CaseRecord) }));
}

export async function createCase(input: Omit<CaseRecord, "createdAt" | "status"> & { status?: CaseStatus }): Promise<string> {
  ensureDb();
  const docRef = await addDoc(collection(db!, "cases"), {
    ...input,
    status: input.status ?? "new",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Decide a case (approve / rework / reject). Returns the new status.
 * Mirrors the source portal's `syncLeadStatus` + `logWorkflowEvent`.
 */
export async function decideCase(
  caseId: string,
  current: CaseRecord,
  action: CaseAction,
  opts: { remarks?: string; user?: string; role?: string } = {},
): Promise<CaseStatus> {
  ensureDb();

  let newStatus: CaseStatus;
  let historyAction: string;
  let patch: Record<string, unknown>;

  if (action === "approve") {
    newStatus = "approved";
    historyAction = "APPROVED";
    patch = { status: newStatus, decidedAt: serverTimestamp(), decidedBy: opts.user };
  } else if (action === "reject") {
    newStatus = "rejected";
    historyAction = "REJECTED";
    patch = { status: newStatus, decidedAt: serverTimestamp(), decidedBy: opts.user, reworkReason: opts.remarks };
  } else {
    // rework
    newStatus = "rework";
    historyAction = "REWORK";
    patch = {
      status: newStatus,
      reworkReason: opts.remarks,
      reworkBy: opts.user,
      decidedAt: serverTimestamp(),
    };
  }

  await updateDoc(doc(db!, "cases", caseId), patch);

  await addDoc(collection(db!, "workflow_history"), {
    applicationNo: current.applicationNo,
    action: historyAction,
    oldStatus: current.status,
    newStatus,
    remarks: opts.remarks?.trim() || undefined,
    user: opts.user,
    role: opts.role,
    createdAt: serverTimestamp(),
  });

  return newStatus;
}

export async function getWorkflowHistory(max = 200): Promise<WorkflowEvent[]> {
  ensureDb();
  const q = query(collection(db!, "workflow_history"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkflowEvent) }));
}

/**
 * Seed a handful of demo cases so the staff portal can be explored before real
 * applications are routed into the `cases` collection. No-op if data exists.
 */
export async function seedCases(): Promise<number> {
  ensureDb();
  const snap = await getDocs(query(collection(db!, "cases"), limit(1)));
  if (!snap.empty) return 0;

  const demo: Omit<CaseRecord, "createdAt" | "status">[] = [
    { applicationNo: "FN-2025-0012", customerName: "Aarav Mehta", mobile: "9812345670", email: "aarav@example.com", loanType: "Personal Loan", loanAmount: 500000, purpose: "Medical Emergency", city: "Mumbai", state: "Maharashtra" },
    { applicationNo: "FN-2025-0011", customerName: "Sneha Reddy", mobile: "9823456781", email: "sneha@example.com", loanType: "Home Loan", loanAmount: 2500000, purpose: "Home Renovation", city: "Hyderabad", state: "Telangana" },
    { applicationNo: "FN-2025-0010", customerName: "Karan Singh", mobile: "9834567892", email: "karan@example.com", loanType: "Business Loan", loanAmount: 1200000, purpose: "Working Capital", city: "Delhi", state: "Delhi" },
    { applicationNo: "FN-2025-0009", customerName: "Priya Nair", mobile: "9845678903", email: "priya@example.com", loanType: "Personal Loan", loanAmount: 800000, purpose: "Education", city: "Kochi", state: "Kerala" },
    { applicationNo: "FN-2025-0008", customerName: "Rohit Deshmukh", mobile: "9856789014", email: "rohit@example.com", loanType: "Car Loan", loanAmount: 650000, purpose: "Vehicle Purchase", city: "Pune", state: "Maharashtra" },
  ];

  for (const c of demo) {
    await addDoc(collection(db!, "cases"), {
      ...c,
      status: c.customerName === "Aarav Mehta" ? "under_review" : "new",
      createdAt: serverTimestamp(),
    });
  }
  return demo.length;
}
