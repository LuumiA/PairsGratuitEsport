"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error: string } | { message: string } | null;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return { error: "Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, _)." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered")) {
      return { error: "Un compte existe déjà avec cet email." };
    }
    if (msg.includes("database error")) {
      return { error: "Ce pseudo est déjà pris, choisis-en un autre." };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return { message: "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter." };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
