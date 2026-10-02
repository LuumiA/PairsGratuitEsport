"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string } | { success: true } | null;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return { error: "Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, _)." };
  }
  if (bio.length > 280) {
    return { error: "La bio ne peut pas dépasser 280 caractères." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, bio: bio || null })
    .eq("id", user.id);

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { error: "Ce pseudo est déjà pris." };
    }
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${username}`);
  return { success: true };
}
