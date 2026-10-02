"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ClaimBonusState = { error: string } | { balance: number } | null;

export async function claimLoginBonus(): Promise<ClaimBonusState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_login_bonus");

  if (error) {
    return { error: error.message.includes("already claimed") ? "Bonus déjà réclamé aujourd'hui." : error.message };
  }

  revalidatePath("/dashboard");
  return { balance: data as number };
}
