import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRecentPastMatches, type VideogameSlug } from "@/lib/pandascore/client";
import { GAME_ID_BY_SLUG } from "@/lib/pandascore/mappers";

const SLUGS: VideogameSlug[] = ["valorant", "csgo", "lol"];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let settled = 0;
  const errors: string[] = [];

  for (const slug of SLUGS) {
    const gameId = GAME_ID_BY_SLUG[slug];
    const pastMatches = await getRecentPastMatches(slug);

    const finished = pastMatches.filter(
      (m) =>
        m.status === "finished" &&
        m.winner_id != null &&
        m.opponents.length === 2 &&
        m.opponents[0].opponent &&
        m.opponents[1].opponent
    );

    if (finished.length === 0) continue;

    const matchIds = finished.map((m) => m.id);
    const { data: existing } = await supabase
      .from("matches")
      .select("id, settled_at, team_a_id, team_b_id")
      .in("id", matchIds);
    const existingById = new Map((existing ?? []).map((m) => [m.id, m]));

    for (const m of finished) {
      const row = existingById.get(m.id);
      if (row?.settled_at) continue; // déjà réglé

      const teamAId = m.opponents[0].opponent!.id;
      const teamBId = m.opponents[1].opponent!.id;

      if (!row) {
        // Match jamais vu en amont (fenêtre de sync manquée) : on crée les
        // lignes minimales nécessaires pour que settle_match() puisse s'exécuter.
        await supabase.from("teams").upsert(
          [
            { id: teamAId, game_id: gameId, name: m.opponents[0].opponent!.name },
            { id: teamBId, game_id: gameId, name: m.opponents[1].opponent!.name },
          ],
          { onConflict: "id" }
        );
        await supabase.from("matches").upsert(
          {
            id: m.id,
            game_id: gameId,
            team_a_id: teamAId,
            team_b_id: teamBId,
            status: "running",
            scheduled_at: m.scheduled_at ?? m.begin_at,
            raw: m as unknown as Record<string, unknown>,
          },
          { onConflict: "id" }
        );
      }

      const { error } = await supabase.rpc("settle_match", {
        p_match_id: m.id,
        p_winner_team_id: m.winner_id!,
      });

      if (error) errors.push(`match ${m.id}: ${error.message}`);
      else settled += 1;
    }
  }

  return NextResponse.json({ settled, errors });
}
