import type { MatchStatus } from "@/lib/types/db";
import type { VideogameSlug } from "@/lib/pandascore/client";

export const GAME_ID_BY_SLUG: Record<VideogameSlug, number> = {
  valorant: 1,
  csgo: 2,
  lol: 3,
};

export function mapStatus(status: string): MatchStatus {
  switch (status) {
    case "not_started":
      return "upcoming";
    case "running":
      return "running";
    case "finished":
      return "finished";
    default:
      return "canceled";
  }
}

export interface TournamentInfo {
  leagueName: string | null;
  tournamentName: string | null;
  tier: string | null;
}

/**
 * PandaScore expose un tier (s/a/b/c/d) par tournoi plutôt qu'un flag
 * "académique" explicite. En pratique le tier d dénote les qualifs
 * fermées, ligues amateurs/universitaires et petits circuits — c'est la
 * donnée la plus proche de ce que l'utilisateur appelle "académique".
 */
export function extractTournamentInfo(raw: Record<string, unknown> | null | undefined): TournamentInfo {
  if (!raw) return { leagueName: null, tournamentName: null, tier: null };
  const league = raw.league as { name?: string } | null | undefined;
  const tournament = raw.tournament as { name?: string; tier?: string } | null | undefined;
  return {
    leagueName: league?.name ?? null,
    tournamentName: tournament?.name ?? null,
    tier: tournament?.tier ?? null,
  };
}

export const TIER_LABELS: Record<string, string> = {
  s: "Élite",
  a: "Premier",
  b: "Challenger",
  c: "Développement",
  d: "Amateur / Académique",
};

export function tierLabel(tier: string | null): string {
  if (!tier) return "Autre";
  return TIER_LABELS[tier.toLowerCase()] ?? "Autre";
}

export interface SeriesScore {
  teamA: number;
  teamB: number;
  bestOf: number | null;
}

/**
 * Score de la série (bo1/bo3/bo5) à partir de `raw.games`. PandaScore marque
 * chaque map terminée avec `status: "finished"` et `winner.id` = id de
 * l'équipe gagnante de cette map (pas du match entier).
 */
export function extractSeriesScore(
  raw: Record<string, unknown> | null | undefined,
  teamAId: number,
  teamBId: number
): SeriesScore | null {
  if (!raw) return null;
  const games = raw.games as Array<{ status?: string; winner?: { id?: number | null } | null }> | undefined;
  if (!games || games.length === 0) return null;

  let teamA = 0;
  let teamB = 0;
  for (const g of games) {
    if (g.status !== "finished") continue;
    const winnerId = g.winner?.id;
    if (winnerId === teamAId) teamA += 1;
    else if (winnerId === teamBId) teamB += 1;
  }
  if (teamA === 0 && teamB === 0) return null;

  const bestOf = typeof raw.number_of_games === "number" ? (raw.number_of_games as number) : null;
  return { teamA, teamB, bestOf };
}
