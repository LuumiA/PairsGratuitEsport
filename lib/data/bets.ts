import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MatchStatus, BetOutcome } from "@/lib/types/db";

export interface BetHistoryItem {
  id: string;
  match_id: number;
  game_id: number;
  match_status: MatchStatus;
  scheduled_at: string | null;
  stake: number;
  odds: number;
  outcome: BetOutcome;
  payout: number | null;
  created_at: string;
  chosen_team_name: string;
  opponent_team_name: string;
}

export async function getMyBets(): Promise<BetHistoryItem[]> {
  const supabase = await createClient();
  const { data: bets } = await supabase
    .from("bets")
    .select("id, match_id, chosen_team_id, stake, odds, outcome, payout, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!bets || bets.length === 0) return [];

  const matchIds = Array.from(new Set(bets.map((b) => b.match_id)));
  const { data: matches } = await supabase
    .from("matches")
    .select("id, game_id, status, scheduled_at, team_a_id, team_b_id")
    .in("id", matchIds);
  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));

  const teamIds = Array.from(new Set((matches ?? []).flatMap((m) => [m.team_a_id, m.team_b_id])));
  const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const items: BetHistoryItem[] = [];
  for (const b of bets) {
    const match = matchById.get(b.match_id);
    if (!match) continue;
    const opponentId = match.team_a_id === b.chosen_team_id ? match.team_b_id : match.team_a_id;
    items.push({
      id: b.id,
      match_id: b.match_id,
      game_id: match.game_id,
      match_status: match.status,
      scheduled_at: match.scheduled_at,
      stake: b.stake,
      odds: b.odds,
      outcome: b.outcome,
      payout: b.payout,
      created_at: b.created_at,
      chosen_team_name: teamNameById.get(b.chosen_team_id) ?? "Équipe inconnue",
      opponent_team_name: teamNameById.get(opponentId) ?? "Équipe inconnue",
    });
  }
  return items;
}
