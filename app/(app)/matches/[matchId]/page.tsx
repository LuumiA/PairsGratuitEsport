import { notFound } from "next/navigation";
import { Lock, Radio } from "lucide-react";
import { getMatchById } from "@/lib/data/matches";
import { gameNameById } from "@/lib/data/games";
import { requireProfile } from "@/lib/data/profile";
import { getTeamRecentForm } from "@/lib/data/teams";
import { createClient } from "@/lib/supabase/server";
import { extractStreams } from "@/lib/pandascore/streams";
import { extractTournamentInfo, extractSeriesScore, tierLabel } from "@/lib/pandascore/mappers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BetSlip } from "@/components/features/matches/bet-slip";
import { StreamLinks } from "@/components/features/matches/stream-links";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const id = Number(matchId);
  if (!Number.isInteger(id)) notFound();

  const match = await getMatchById(id);
  if (!match) notFound();

  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: myBets } = await supabase
    .from("bets")
    .select("id, chosen_team_id, stake, odds, outcome, payout")
    .eq("match_id", id)
    .order("created_at", { ascending: false });

  const date = match.scheduled_at
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(match.scheduled_at))
    : null;

  const winnerName =
    match.winner_team_id === match.team_a.id
      ? match.team_a.name
      : match.winner_team_id === match.team_b.id
        ? match.team_b.name
        : null;

  const streams = extractStreams(match.raw ?? null);
  const { leagueName, tournamentName, tier } = extractTournamentInfo(match.raw ?? null);
  const seriesScore = extractSeriesScore(match.raw ?? null, match.team_a.id, match.team_b.id);
  const [formA, formB] = await Promise.all([
    getTeamRecentForm(match.team_a.id),
    getTeamRecentForm(match.team_b.id),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{gameNameById(match.game_id)}</Badge>
        {tier && (
          <Badge variant="outline" className="border-white/10 text-muted-foreground">
            {tierLabel(tier)}
          </Badge>
        )}
        {leagueName && (
          <span className="text-xs text-muted-foreground">
            {leagueName}
            {tournamentName && tournamentName !== leagueName ? ` · ${tournamentName}` : ""}
          </span>
        )}
      </div>

      <Card className="border-white/10">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          {match.status === "running" ? (
            <Badge className="gap-1 border-neon-loss/40 bg-neon-loss/10 text-neon-loss">
              <Radio className="size-3 animate-pulse" /> EN DIRECT
              {seriesScore && (
                <span className="font-bold">
                  {" "}
                  {seriesScore.teamA}-{seriesScore.teamB}
                </span>
              )}
            </Badge>
          ) : (
            date && <span className="text-sm text-muted-foreground">{date}</span>
          )}

          <div className="flex w-full items-center justify-around">
            {[
              { team: match.team_a, form: formA },
              { team: match.team_b, form: formB },
            ].map(({ team, form }) => (
              <div key={team.id} className="flex flex-col items-center gap-2">
                <Avatar className="size-16">
                  <AvatarImage src={team.logo_url ?? undefined} alt={team.name} />
                  <AvatarFallback className="text-lg">
                    {team.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{team.name}</span>
                <span className="text-xs text-muted-foreground">{Math.round(team.rating)} Elo</span>
                {form.length > 0 && (
                  <div className="flex gap-1">
                    {form.map((result, i) => (
                      <span
                        key={i}
                        className={
                          result === "W"
                            ? "flex size-4 items-center justify-center rounded-sm bg-neon-win/20 text-[9px] font-bold text-neon-win"
                            : "flex size-4 items-center justify-center rounded-sm bg-neon-loss/20 text-[9px] font-bold text-neon-loss"
                        }
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                )}
                {winnerName === team.name && (
                  <Badge className="border-neon-win/40 bg-neon-win/10 text-neon-win">Vainqueur</Badge>
                )}
              </div>
            ))}
          </div>

          <StreamLinks streams={streams} />
        </CardContent>
      </Card>

      {match.status === "upcoming" ? (
        <BetSlip
          matchId={match.id}
          teamA={{ id: match.team_a.id, name: match.team_a.name, odds: match.odds_a ?? 1.5 }}
          teamB={{ id: match.team_b.id, name: match.team_b.name, odds: match.odds_b ?? 1.5 }}
          pointsBalance={profile.points_balance}
        />
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-1 p-4 text-sm text-muted-foreground">
          <Lock className="size-4" />
          {match.status === "running"
            ? "Paris fermés — le match est en cours."
            : "Ce match est terminé."}
        </div>
      )}

      {myBets && myBets.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Mes paris sur ce match</h2>
          {myBets.map((bet) => {
            const teamName = bet.chosen_team_id === match.team_a.id ? match.team_a.name : match.team_b.name;
            return (
              <Card key={bet.id} className="border-white/10">
                <CardContent className="flex items-center justify-between py-3 text-sm">
                  <span>
                    {bet.stake} pts sur <span className="font-medium">{teamName}</span> (cote {bet.odds})
                  </span>
                  <Badge
                    variant={bet.outcome === "won" ? "default" : bet.outcome === "lost" ? "destructive" : "secondary"}
                  >
                    {bet.outcome === "pending"
                      ? "En attente"
                      : bet.outcome === "won"
                        ? `+${bet.payout} pts`
                        : "Perdu"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
