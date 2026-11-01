import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Manage Financily employee and agent accounts.",
  robots: { index: false, follow: false },
};

// Hidden route — reachable only after admin login (/admin-login).
export default function AdminPage() {
  return <AdminDashboard />;
}
