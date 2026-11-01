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
  employmentType: "salaried" | "self-employed";
  companyName: string;
  monthlyIncome: number;
  loanAmount: number;
  purpose: string;
  city: string;
  status: "submitted" | "under_review" | "offer_received" | "disbursed" | "rejected";
  lender?: string;
  offerRate?: number;
  createdAt?: Timestamp | Date;
}

function ensureDb() {
  if (!db) throw new Error("Firebase Firestore is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.");
}

export async function saveApplication(app: Omit<LoanApplication, "id" | "createdAt">): Promise<string> {
  ensureDb();
  const docRef = await addDoc(collection(db!, "users", app.uid, "applications"), {
    ...app,
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
