import "server-only";
import { createClient } from "@/lib/supabase/server";

export type FormResult = "W" | "L";

export async function getTeamRecentForm(teamId: number, limit = 5): Promise<FormResult[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("winner_team_id, team_a_id, team_b_id, scheduled_at")
    .eq("status", "finished")
    .not("winner_team_id", "is", null)
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((m) => (m.winner_team_id === teamId ? "W" : "L"));
}
