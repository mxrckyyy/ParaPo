"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password needs at least 6 characters."),
});

export type AuthOutcome =
  | { ok: true; confirmationSent: true }
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

/** Real Supabase signup. No session = email confirmation required (see notice). */
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
  if (!data.session) return { ok: true, confirmationSent: true };
  revalidatePath("/", "layout");
  redirect("/profile");
}

/** Real Supabase login. */
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
  redirect("/profile");
}

/** Real Supabase logout. */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
