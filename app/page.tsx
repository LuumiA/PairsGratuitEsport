import Link from "next/link";
import { Swords, Brain, Users, Trophy, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SessionRedirect } from "@/components/auth/session-redirect";

const GAMES = ["Valorant", "CS2", "League of Legends"];

const FEATURES = [
  {
    icon: Swords,
    title: "Vrais matchs, fausses mises",
    description:
      "Parie sur les matchs pro Valorant, CS2 et LoL avec des cotes qui évoluent selon la forme des équipes.",
  },
  {
    icon: Brain,
    title: "Quiz quotidien",
    description: "Réponds aux questions esport du jour pour gagner des points, chaque jour.",
  },
  {
    icon: Users,
    title: "Groupes & mini-tournois",
    description: "Crée un groupe, invite tes potes, fixe une durée : que le meilleur gagne.",
  },
  {
    icon: Trophy,
    title: "Classement du serveur",
    description: "Taux de victoire, points gagnés, nombre de paris — grimpe dans le classement global.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <SessionRedirect />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <span className="text-lg font-bold tracking-tight text-gradient-neon">
          PairsGratuitEsport
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <Button render={<Link href="/dashboard" />} nativeButton={false} className="glow-primary">
              Mon dashboard
            </Button>
          ) : (
            <>
              <Button render={<Link href="/login" />} nativeButton={false} variant="ghost">
                Connexion
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false} className="glow-primary">
                S&apos;inscrire
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <Badge variant="outline" className="gap-1.5 border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan">
            <Sparkles className="size-3.5" />
            100% gratuit, aucune mise réelle
          </Badge>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Parie sur l&apos;esport.{" "}
            <span className="text-gradient-neon">Gagne des points, pas d&apos;argent.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Valorant, CS2 et League of Legends. Gagne des points chaque jour, mise-les sur les
            vrais matchs pro, défie tes amis en groupe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {GAMES.map((g) => (
              <Badge key={g} variant="secondary" className="px-3 py-1 text-sm">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              render={<Link href={user ? "/dashboard" : "/register"} />}
              nativeButton={false}
              size="lg"
              className="glow-primary"
            >
              Commencer gratuitement
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Aucune carte bancaire, jamais.
          </p>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-white/10 bg-surface-1/60">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-neon-violet/10 text-neon-violet">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
        PairsGratuitEsport — plateforme de prédiction esport gratuite, à but ludique uniquement.
      </footer>
    </div>
  );
}
