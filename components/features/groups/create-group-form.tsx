"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createGroup, type GroupFormState } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState<GroupFormState, FormData>(
    (prevState, formData) => {
      // datetime-local n'a pas de fuseau horaire ; on convertit ici, dans le
      // navigateur du visiteur, pour ne pas laisser le serveur (fuseau
      // potentiellement différent, ex. UTC sur Vercel) mal interpréter l'heure.
      for (const field of ["tournament_start", "tournament_end"] as const) {
        const value = formData.get(field);
        if (typeof value === "string" && value) {
          formData.set(field, new Date(value).toISOString());
        }
      }
      return createGroup(prevState, formData);
    },
    null
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du groupe</Label>
        <Input id="name" name="name" required minLength={3} placeholder="Les Champions du Dimanche" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tournament_start">Début du tournoi</Label>
          <Input id="tournament_start" name="tournament_start" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tournament_end">Fin du tournoi</Label>
          <Input id="tournament_end" name="tournament_end" type="datetime-local" required />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="glow-primary">
        {pending ? "Création..." : "Créer le groupe"}
      </Button>
    </form>
  );
}
