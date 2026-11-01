import type { Metadata } from "next";
import { StaffDashboard } from "@/components/staff/StaffDashboard";

export const metadata: Metadata = {
  title: "Staff Portal",
  description: "Internal tool for Financily agents and employees.",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return <StaffDashboard />;
}
