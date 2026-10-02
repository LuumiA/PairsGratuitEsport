import Link from "next/link";
import { Radio } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchWithTeams } from "@/lib/data/matches";

function TeamBlock({ team }: { team: MatchWithTeams["team_a"] }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <Avatar className="size-12">
        <AvatarImage src={team.logo_url ?? undefined} alt={team.name} />
        <AvatarFallback>{team.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium leading-tight">{team.name}</span>
    </div>
  );
}

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const isLive = match.status === "running";
  const date = match.scheduled_at
    ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
        new Date(match.scheduled_at)
      )
    : null;

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="h-full border-white/10 transition-colors hover:border-neon-violet/40 hover:bg-surface-2">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between">
            {isLive ? (
              <Badge className="gap-1 border-neon-loss/40 bg-neon-loss/10 text-neon-loss">
                <Radio className="size-3 animate-pulse" /> EN DIRECT
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">{date}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <TeamBlock team={match.team_a} />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <TeamBlock team={match.team_b} />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
            <span className="font-semibold text-neon-cyan">
              {match.odds_a ? match.odds_a.toFixed(2) : "—"}
            </span>
            <span className="text-xs text-muted-foreground">cotes</span>
            <span className="font-semibold text-neon-cyan">
              {match.odds_b ? match.odds_b.toFixed(2) : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
