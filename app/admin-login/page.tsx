import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Restricted admin login for the Financily platform.",
  robots: { index: false, follow: false },
};

// Hidden route — not linked in the public navigation or footer. Only reachable
// by direct URL (/admin-login).
export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
