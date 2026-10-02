"use client";

import { useActionState } from "react";
import { createQuestion, type QuizFormState } from "@/lib/actions/admin-quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GAMES } from "@/lib/data/games";

export function QuizQuestionForm() {
  const [state, formAction, pending] = useActionState<QuizFormState, FormData>(
    createQuestion,
    null
  );

  return (
    <form action={formAction} key={state && "success" in state ? Math.random() : "form"} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="game_id">Jeu</Label>
          <select
            id="game_id"
            name="game_id"
            required
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulté (1-3)</Label>
          <Input id="difficulty" name="difficulty" type="number" min={1} max={3} defaultValue={1} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input id="question" name="question" required placeholder="Quel joueur a le plus de kills sur..." />
      </div>

      <div className="space-y-2">
        <Label>Réponses (coche la bonne)</Label>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" name="correct_index" value={i} required={i === 0} className="accent-primary" />
            <Input name={`choice_${i}`} placeholder={`Réponse ${i + 1}${i < 2 ? "" : " (optionnel)"}`} />
          </div>
        ))}
      </div>

      {state && "error" in state && <p className="text-sm text-destructive">{state.error}</p>}
      {state && "success" in state && <p className="text-sm text-neon-win">Question ajoutée !</p>}

      <Button type="submit" disabled={pending} className="glow-primary">
        {pending ? "Ajout..." : "Ajouter la question"}
      </Button>
    </form>
  );
}
