import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Financily account to manage loan applications and offers.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[50vh] place-items-center"><div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
