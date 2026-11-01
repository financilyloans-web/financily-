import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
  description: "Set a new password for your Financily account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[50vh] place-items-center"><div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
