import type { Metadata } from "next";
import { InternalLoginForm } from "@/components/auth/InternalLoginForm";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Restricted internal login for Financily agents and employees.",
  robots: { index: false, follow: false },
};

// Hidden route — not linked in the public navigation or footer. Only reachable
// by direct URL (/staff-login).
export default function StaffLoginPage() {
  return <InternalLoginForm />;
}
