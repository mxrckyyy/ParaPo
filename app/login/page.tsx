import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in — PARA PO" };

export default function LoginPage() {
  return (
    <div className="py-6">
      <AuthForm mode="login" />
    </div>
  );
}
