import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign up — PARA PO" };

export default function SignupPage() {
  return (
    <div className="py-6">
      <AuthForm mode="signup" />
    </div>
  );
}
