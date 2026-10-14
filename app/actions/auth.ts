"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password needs at least 6 characters."),
});

export type AuthOutcome =
  | { ok: true; confirmationSent: boolean; redirectTo: string | null }
  | { ok: false; error: string };

function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Incorrect email or password.";
  if (/user already registered|already exists/i.test(message))
    return "That email is already registered. Try logging in instead.";
  if (/email not confirmed/i.test(message))
    return "Please confirm your email first — check your inbox for the verification link.";
  if (/password/i.test(message) && /weak|short|characters/i.test(message))
    return "Please choose a stronger password (at least 6 characters).";
  return "Something went wrong. Please try again.";
}

/**
 * Real Supabase signup. Returns a result object on EVERY path — never calls
 * redirect() (see note below). No session = email confirmation required.
 */
export async function signUp(formData: FormData): Promise<AuthOutcome> {
  const parsed = authSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check this form." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: friendlyError(error.message) };
  // Email confirmation ON (project default) → no session until user clicks the link.
  if (!data.session) return { ok: true, confirmationSent: true, redirectTo: null };
  revalidatePath("/", "layout");
  return { ok: true, confirmationSent: false, redirectTo: "/profile" };
}

/**
 * Real Supabase login. Returns a result object on EVERY path — never calls
 * redirect() (see note below).
 *
 * NOTE (BUG-03): redirect() inside a Server Action throws a NEXT_REDIRECT
 * signal. When the action is awaited imperatively from an event handler, the
 * client dispatcher consumes the redirect response and the awaited promise
 * resolves with `undefined` — so reading `outcome.ok` crashed with
 * "Cannot read properties of undefined (reading 'ok')" precisely on
 * successful login. Navigation now happens client-side from `redirectTo`,
 * so no redirect signal is ever thrown or swallowed here.
 */
export async function signIn(formData: FormData): Promise<AuthOutcome> {
  const parsed = authSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check this form." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: friendlyError(error.message) };
  revalidatePath("/", "layout");
  return { ok: true, confirmationSent: false, redirectTo: "/profile" };
}

/** Real Supabase logout. Returns the post-logout destination (same BUG-03 note). */
export async function signOut(): Promise<{ redirectTo: string }> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { redirectTo: "/login" };
}
