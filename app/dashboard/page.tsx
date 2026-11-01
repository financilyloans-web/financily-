import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardInner } from "@/components/dashboard/DashboardInner";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Financily profile, loan applications, eligibility and saved requests.",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
