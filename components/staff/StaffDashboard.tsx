"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, Briefcase, UserCog, ShieldCheck } from "lucide-react";

type Role = "agent" | "employee";

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("employee");

  useEffect(() => {
    setRole((sessionStorage.getItem("financily_staff_role") as Role) || "employee");
  }, []);

  const signOut = async () => {
    sessionStorage.removeItem("financily_staff_role");
    await logout();
    router.replace("/staff-login");
  };

  const isAgent = role === "agent";

  return (
    <RequireAuth>
      <div className="section-shell py-12">
        <div className="glass-strong mx-auto max-w-2xl rounded-[2rem] p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                {isAgent ? <Briefcase className="h-6 w-6" /> : <UserCog className="h-6 w-6" />}
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-white">
                  {isAgent ? "Agent Portal" : "Employee Portal"}
                </h1>
                <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Signed in as {isAgent ? "agent" : "employee"}
                </p>
              </div>
            </div>
            <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">
              Welcome to the internal Financily {isAgent ? "agent" : "employee"} workspace,{" "}
              <span className="font-semibold text-white">{user?.email}</span>.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Lead management, lender matching, and applicant workflow tools are
              being provisioned for this portal.
            </p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
