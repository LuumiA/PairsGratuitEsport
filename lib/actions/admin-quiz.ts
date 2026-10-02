"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QuizFormState = { error: string } | { success: true } | null;

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return supabase;
}

export async function createQuestion(
  _prevState: QuizFormState,
  formData: FormData
): Promise<QuizFormState> {
  const gameId = Number(formData.get("game_id"));
  const question = String(formData.get("question") ?? "").trim();
  const difficulty = Number(formData.get("difficulty") ?? 1);
  const correctIndex = Number(formData.get("correct_index"));
  const choices = [0, 1, 2, 3]
    .map((i) => String(formData.get(`choice_${i}`) ?? "").trim())
    .filter(Boolean);

  if (!question || choices.length < 2) {
    return { error: "Il faut une question et au moins 2 réponses." };
  }
  if (correctIndex < 0 || correctIndex >= choices.length) {
    return { error: "Sélectionne la bonne réponse." };
  }

  const supabase = await requireAdminClient();
  const { error } = await supabase.from("quiz_questions").insert({
    game_id: gameId,
    question,
    choices,
    correct_index: correctIndex,
    difficulty,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/quiz");
  return { success: true };
}

export async function toggleQuestionActive(id: number, isActive: boolean) {
  const supabase = await requireAdminClient();
  await supabase.from("quiz_questions").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/quiz");
}

export async function deleteQuestion(id: number) {
  const supabase = await requireAdminClient();
  await supabase.from("quiz_questions").delete().eq("id", id);
  revalidatePath("/admin/quiz");
}
