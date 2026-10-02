import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { QuizAnswer } from "@/lib/types/db";

const QUESTIONS_PER_GAME = 2;

async function pickQuestionIds(admin: ReturnType<typeof createAdminClient>): Promise<number[]> {
  const { data } = await admin.from("quiz_questions").select("id, game_id").eq("is_active", true);
  if (!data?.length) return [];

  const byGame = new Map<number, number[]>();
  for (const q of data) {
    const arr = byGame.get(q.game_id) ?? [];
    arr.push(q.id);
    byGame.set(q.game_id, arr);
  }

  const picked: number[] = [];
  for (const ids of byGame.values()) {
    picked.push(...[...ids].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME));
  }
  return picked;
}

/** Crée le quiz du jour s'il n'existe pas encore — appelé par le cron ET en
 * filet de sécurité depuis la page si le cron n'est pas encore passé. */
export async function ensureDailyQuiz(quizDate: string): Promise<number[] | null> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("daily_quiz")
    .select("question_ids")
    .eq("quiz_date", quizDate)
    .maybeSingle();
  if (existing) return existing.question_ids;

  const ids = await pickQuestionIds(admin);
  if (ids.length === 0) return null;

  const { error } = await admin.from("daily_quiz").insert({ quiz_date: quizDate, question_ids: ids });
  if (error) {
    // Course avec une autre requête concurrente : on relit simplement.
    const { data: retry } = await admin
      .from("daily_quiz")
      .select("question_ids")
      .eq("quiz_date", quizDate)
      .maybeSingle();
    return retry?.question_ids ?? null;
  }
  return ids;
}

export interface QuizQuestionForPlayer {
  id: number;
  game_id: number;
  question: string;
  choices: string[];
  difficulty: number;
}

export async function getTodayQuizForUser(): Promise<{
  quizDate: string;
  questions: QuizQuestionForPlayer[];
  attempt: { score: number; points_awarded: number; answers: QuizAnswer[] } | null;
}> {
  const quizDate = new Date().toISOString().slice(0, 10);
  const questionIds = await ensureDailyQuiz(quizDate);

  const supabase = await createClient();

  let questions: QuizQuestionForPlayer[] = [];
  if (questionIds?.length) {
    const { data } = await supabase
      .from("quiz_questions_public")
      .select("id, game_id, question, choices, difficulty")
      .in("id", questionIds);
    questions = data ?? [];
  }

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("score, points_awarded, answers")
    .eq("quiz_date", quizDate)
    .maybeSingle();

  return { quizDate, questions, attempt: attempt ?? null };
}
