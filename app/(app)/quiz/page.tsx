import { Brain } from "lucide-react";
import { getTodayQuizForUser } from "@/lib/data/quiz";
import { QuizForm } from "@/components/features/quiz/quiz-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Quiz du jour" };

export default async function QuizPage() {
  const { questions, attempt, quizDate } = await getTodayQuizForUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Quiz du jour</h1>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Pas de quiz disponible aujourd&apos;hui — reviens plus tard !
        </p>
      ) : attempt ? (
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Déjà répondu aujourd&apos;hui</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Score : <span className="font-semibold">{attempt.score} / {questions.length}</span>
            </p>
            <Badge
              className={
                attempt.points_awarded > 0
                  ? "border-neon-win/40 bg-neon-win/10 text-neon-win"
                  : "border-white/20 bg-white/5 text-muted-foreground"
              }
            >
              +{attempt.points_awarded} points
            </Badge>
            <p className="text-sm text-muted-foreground">Reviens demain pour un nouveau quiz.</p>
          </CardContent>
        </Card>
      ) : (
        <QuizForm quizDate={quizDate} questions={questions} />
      )}
    </div>
  );
}
