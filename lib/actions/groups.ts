"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GroupFormState = { error: string } | null;

export async function createGroup(
  _prevState: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const start = String(formData.get("tournament_start") ?? "");
  const end = String(formData.get("tournament_end") ?? "");

  if (name.length < 3) {
    return { error: "Le nom du groupe doit faire au moins 3 caractères." };
  }
  if (!start || !end || new Date(end) <= new Date(start)) {
    return { error: "La date de fin doit être après la date de début." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      owner_id: user.id,
      tournament_start: new Date(start).toISOString(),
      tournament_end: new Date(end).toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/groups");
  redirect(`/groups/${data.id}`);
}

export async function joinGroup(
  _prevState: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const code = String(formData.get("invite_code") ?? "").trim();
  if (!code) return { error: "Code d'invitation requis." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group", { p_invite_code: code });

  if (error) return { error: "Code d'invitation invalide." };

  revalidatePath("/groups");
  redirect(`/groups/${data.group_id}`);
}
