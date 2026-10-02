"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { gameNameById } from "@/lib/data/games";
import type { QuizQuestionForPlayer } from "@/lib/data/quiz";

export function QuizForm({
  quizDate,
  questions,
}: {
  quizDate: string;
  questions: QuizQuestionForPlayer[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; points_awarded: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function submit() {
    startTransition(async () => {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("submit_quiz", {
        p_quiz_date: quizDate,
        p_answers: questions.map((q) => ({ question_id: q.id, chosen_index: answers[q.id] })),
      });

      if (rpcError) {
        toast.error(rpcError.message);
        return;
      }

      setResult({ score: data!.score, points_awarded: data!.points_awarded });
      toast.success(`+${data!.points_awarded} points crédités !`);
      router.refresh();
    });
  }

  if (result) {
    return (
      <Card className="border-white/10">
        <CardContent className="space-y-2 pt-6 text-center">
          <p className="text-lg font-bold">
            {result.score} / {questions.length} bonnes réponses
          </p>
          <Badge className="border-neon-win/40 bg-neon-win/10 text-neon-win">
            +{result.points_awarded} points
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <Card key={q.id} className="border-white/10">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{gameNameById(q.game_id)}</Badge>
              <span className="text-xs text-muted-foreground">Question {idx + 1}</span>
            </div>
            <p className="font-medium">{q.question}</p>
            <div className="space-y-2">
              {q.choices.map((choice, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    answers[q.id] === i
                      ? "border-neon-violet bg-neon-violet/10"
                      : "border-white/10 bg-surface-2 hover:border-white/20"
                  )}
                >
                  {choice}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={submit} disabled={!allAnswered || pending} className="w-full glow-primary">
        {pending ? "Envoi..." : "Valider mes réponses"}
      </Button>
    </div>
  );
}
