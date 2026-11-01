import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export type StaffRole = "agent" | "employee" | "admin";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  agent: "Agent",
  employee: "Employee",
  admin: "Admin",
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Look up the role provisioned for a staff email in the Firestore `staff`
 * collection. This is the authoritative source-of-truth that keeps agent and
 * employee accounts separate. Returns null when the email is not provisioned
 * (or the backend is not configured).
 *
 * IMPORTANT: staff documents MUST be keyed by the normalized email (document id
 * == email). The Firestore security rules use `exists(/staff/<email>)` to grant
 * access to the internal `cases` / `workflow_history` collections, and rules
 * cannot query by field — so the client lookup and the rules must both key on
 * the exact lowercase email. Auto-ID documents (email stored as a field) are not
 * supported and will be treated as not-provisioned.
 */
export async function getStaffRole(email: string): Promise<StaffRole | null> {
  if (!db) return null;
  const normalized = normalizeEmail(email);
  try {
    const direct = await getDoc(doc(db, "staff", normalized));
    if (!direct.exists()) return null;
    const role = direct.data().role;
    return role === "agent" || role === "employee" || role === "admin"
      ? (role as StaffRole)
      : null;
  } catch {
    return null;
  }
}

/** True when the provisioned role matches the portal the user selected. */
export function roleMatches(provisioned: StaffRole | null, selected: StaffRole): boolean {
  return !!provisioned && provisioned === selected;
}
