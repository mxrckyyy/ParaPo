"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

/** Real Supabase email/password form. Sessions persist via httpOnly cookies. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setConfirmationSent(false);
    setPending(true);
    try {
      const form = new FormData();
      form.set("email", email);
      form.set("password", password);
      const outcome = mode === "login" ? await signIn(form) : await signUp(form);
      // Success with a session redirects inside the action (never returns).
      if (!outcome.ok) setError(outcome.error);
      else if (outcome.confirmationSent) setConfirmationSent(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-bold text-asphalt">
        {mode === "login" ? "Log in to PARA PO" : "Create a PARA PO account"}
      </h1>
      <p className="mt-1 text-sm text-asphalt-muted">
        {mode === "login"
          ? "Welcome back, commuter."
          : "One account for favorites, reports, and trip sharing."}
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>
      {confirmationSent ? (
        <p role="status" className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dark">
          Account created — check your email for the confirmation link, then log in.
          (Email delivery depends on the Supabase project&apos;s mail settings.)
        </p>
      ) : null}
    </Card>
  );
}
