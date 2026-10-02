"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, null);

  return (
    <Card className="border-white/10">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          1000 points offerts à l&apos;inscription. Aucune mise réelle, jamais.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Pseudo</Label>
            <Input id="username" name="username" required minLength={3} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state && "message" in state && (
            <p className="text-sm text-neon-win">{state.message}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full glow-primary" disabled={pending}>
            {pending ? "Création..." : "Créer mon compte"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-neon-cyan hover:underline">
              Connecte-toi
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
