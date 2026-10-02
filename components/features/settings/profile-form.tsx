"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ username, bio }: { username: string; bio: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Pseudo</Label>
        <Input id="username" name="username" defaultValue={username} minLength={3} maxLength={20} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          maxLength={280}
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder="Ton jeu préféré, ton rôle, tes joueurs pros favoris..."
        />
      </div>
      {state && "error" in state && <p className="text-sm text-destructive">{state.error}</p>}
      {state && "success" in state && (
        <p className="text-sm text-neon-win">Profil mis à jour !</p>
      )}
      <Button type="submit" disabled={pending} className="glow-primary">
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
