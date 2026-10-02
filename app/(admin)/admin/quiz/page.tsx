import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestionForm } from "@/components/features/admin/quiz-question-form";
import { QuizQuestionRow } from "@/components/features/admin/quiz-question-row";

export const metadata = { title: "Admin — Quiz" };

export default async function AdminQuizPage() {
  const profile = await requireProfile();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, game_id, question, choices, correct_index, difficulty, is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Banque de questions — Quiz</h1>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Nouvelle question</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizQuestionForm />
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Questions ({questions?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!questions?.length ? (
            <p className="text-sm text-muted-foreground">Aucune question pour l&apos;instant.</p>
          ) : (
            questions.map((q) => <QuizQuestionRow key={q.id} q={q} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
