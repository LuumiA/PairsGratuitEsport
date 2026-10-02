import Link from "next/link";
import { Swords, Brain, Users, Trophy, History } from "lucide-react";
import { requireProfile } from "@/lib/data/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaimBonusButton } from "@/components/features/dashboard/claim-bonus-button";

const SHORTCUTS = [
  {
    href: "/matches",
    icon: Swords,
    title: "Matchs en cours",
    description: "Mise sur les prochains matchs Valorant, CS2 et LoL.",
  },
  {
    href: "/quiz",
    icon: Brain,
    title: "Quiz du jour",
    description: "Réponds aux questions esport et gagne des points.",
  },
  {
    href: "/groups",
    icon: Users,
    title: "Mes groupes",
    description: "Crée un mini-tournoi entre amis.",
  },
  {
    href: "/leaderboard",
    icon: Trophy,
    title: "Classement",
    description: "Compare-toi à tous les joueurs du serveur.",
  },
  {
    href: "/bets",
    icon: History,
    title: "Mes paris",
    description: "Retrouve l'historique de tous tes paris passés.",
  },
];

export default async function DashboardPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Salut {profile.username} 👋</h1>
        <p className="text-muted-foreground">
          Tu as{" "}
          <span className="font-semibold text-neon-violet">
            {profile.points_balance.toLocaleString("fr-FR")} points
          </span>{" "}
          à miser.
        </p>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Bonus quotidien</CardTitle>
          <CardDescription>Une fois par jour, gratuit.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClaimBonusButton />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {SHORTCUTS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href}>
            <Card className="h-full border-white/10 transition-colors hover:border-neon-violet/40 hover:bg-surface-2">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-neon-violet/10 text-neon-violet">
                  <Icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
