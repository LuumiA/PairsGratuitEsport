import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MatchStatus } from "@/lib/types/db";

export interface MatchTeam {
  id: number;
  name: string;
  logo_url: string | null;
  rating: number;
}

export interface MatchWithTeams {
  id: number;
  game_id: number;
  status: MatchStatus;
  scheduled_at: string | null;
  odds_a: number | null;
  odds_b: number | null;
  betting_locked_at: string | null;
  winner_team_id: number | null;
  raw?: Record<string, unknown> | null;
  team_a: MatchTeam;
  team_b: MatchTeam;
}

async function attachTeams<T extends { team_a_id: number; team_b_id: number }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  matches: T[]
): Promise<(T & { team_a: MatchTeam; team_b: MatchTeam })[]> {
  if (matches.length === 0) return [];

  const teamIds = Array.from(new Set(matches.flatMap((m) => [m.team_a_id, m.team_b_id])));
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, logo_url, rating")
    .in("id", teamIds);
  const teamById = new Map((teams ?? []).map((t) => [t.id, t]));

  return matches
    .filter((m) => teamById.has(m.team_a_id) && teamById.has(m.team_b_id))
    .map((m) => ({ ...m, team_a: teamById.get(m.team_a_id)!, team_b: teamById.get(m.team_b_id)! }));
}

export async function getUpcomingAndLiveMatches(): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, game_id, status, scheduled_at, odds_a, odds_b, betting_locked_at, winner_team_id, team_a_id, team_b_id"
    )
    .in("status", ["upcoming", "running"])
    .order("scheduled_at", { ascending: true })
    .limit(150);

  return attachTeams(supabase, matches ?? []);
}

export async function getMatchById(id: number): Promise<MatchWithTeams | null> {
  const supabase = await createClient();
  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, game_id, status, scheduled_at, odds_a, odds_b, betting_locked_at, winner_team_id, team_a_id, team_b_id, raw"
    )
    .eq("id", id)
    .single();

  if (!match) return null;

  const withTeams = await attachTeams(supabase, [match]);
  return withTeams[0] ?? null;
}
