"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

/**
 * Static auth layout for Phase 1. No Supabase calls, no sessions, no fake login —
 * submitting only explains that real authentication ships in Phase 2.
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setError(undefined);
    setNotice(true);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-bold text-asphalt">
        {mode === "login" ? "Log in to PARA PO" : "Create a PARA PO account"}
      </h1>
      <p className="mt-1 text-sm text-asphalt-muted">
        {mode === "login"
          ? "Accounts are not active yet — this layout previews the Phase 2 sign-in screen."
          : "Accounts are not active yet — this layout previews the Phase 2 registration screen."}
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <Button type="submit">{mode === "login" ? "Log in" : "Sign up"}</Button>
      </form>
      {notice ? (
        <p role="status" className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-asphalt">
          Demo only — nothing was sent or created. Real email/password authentication
          (Supabase Auth) launches in Phase 2.
        </p>
      ) : null}
    </Card>
  );
}
