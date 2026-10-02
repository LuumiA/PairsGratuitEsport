"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteQuestion, toggleQuestionActive } from "@/lib/actions/admin-quiz";
import { gameNameById } from "@/lib/data/games";

export interface QuizQuestionRowData {
  id: number;
  game_id: number;
  question: string;
  choices: string[];
  correct_index: number;
  difficulty: number;
  is_active: boolean;
}

export function QuizQuestionRow({ q }: { q: QuizQuestionRowData }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{gameNameById(q.game_id)}</Badge>
          <Badge variant="outline">Difficulté {q.difficulty}</Badge>
        </div>
        <p className="font-medium">{q.question}</p>
        <p className="text-xs text-muted-foreground">
          {q.choices.map((c, i) => (
            <span key={i} className={i === q.correct_index ? "font-semibold text-neon-win" : ""}>
              {c}
              {i < q.choices.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={q.is_active}
          disabled={pending}
          onCheckedChange={(checked) => startTransition(() => toggleQuestionActive(q.id, checked))}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          onClick={() => startTransition(() => deleteQuestion(q.id))}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
