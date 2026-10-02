import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUpcomingMatches, getRunningMatches, type VideogameSlug } from "@/lib/pandascore/client";
import { GAME_ID_BY_SLUG, mapStatus } from "@/lib/pandascore/mappers";
import { computeOdds } from "@/lib/odds/elo";
import type { PandaScoreMatch } from "@/lib/pandascore/types";

const SLUGS: VideogameSlug[] = ["valorant", "csgo", "lol"];

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return unauthorized();
  }

  const supabase = createAdminClient();

  const batches = await Promise.all(
    SLUGS.map(async (slug) => {
      const [upcoming, running] = await Promise.all([
        getUpcomingMatches(slug),
        getRunningMatches(slug),
      ]);
      return { slug, matches: [...upcoming, ...running] };
    })
  );

  let teamsUpserted = 0;
  let matchesUpserted = 0;
  const skipped: number[] = [];

  for (const { slug, matches } of batches) {
    const gameId = GAME_ID_BY_SLUG[slug];

    const isUsable = (m: PandaScoreMatch) =>
      m.opponents.length === 2 && !!m.opponents[0].opponent && !!m.opponents[1].opponent;

    const usable = matches.filter(isUsable);
    skipped.push(...matches.filter((m) => !isUsable(m)).map((m) => m.id));

    if (usable.length === 0) continue;

    const teamRows = usable.flatMap((m) => [
      {
        id: m.opponents[0].opponent!.id,
        game_id: gameId,
        name: m.opponents[0].opponent!.name,
        logo_url: m.opponents[0].opponent!.image_url,
      },
      {
        id: m.opponents[1].opponent!.id,
        game_id: gameId,
        name: m.opponents[1].opponent!.name,
        logo_url: m.opponents[1].opponent!.image_url,
      },
    ]);

    const uniqueTeamRows = Array.from(new Map(teamRows.map((t) => [t.id, t])).values());

    const { error: teamsError } = await supabase.from("teams").upsert(uniqueTeamRows, {
      onConflict: "id",
    });
    if (teamsError) throw new Error(`teams upsert failed: ${teamsError.message}`);
    teamsUpserted += uniqueTeamRows.length;

    const teamIds = uniqueTeamRows.map((t) => t.id);
    const matchIds = usable.map((m) => m.id);

    const [{ data: ratingRows }, { data: existingMatches }] = await Promise.all([
      supabase.from("teams").select("id, rating").in("id", teamIds),
      supabase.from("matches").select("id, status, betting_locked_at, odds_a, odds_b").in("id", matchIds),
    ]);

    const ratingById = new Map((ratingRows ?? []).map((t) => [t.id, t.rating]));
    const existingById = new Map((existingMatches ?? []).map((m) => [m.id, m]));

    const matchRows = usable.map((m) => {
      const teamAId = m.opponents[0].opponent!.id;
      const teamBId = m.opponents[1].opponent!.id;
      const status = mapStatus(m.status);
      const existing = existingById.get(m.id);
      const alreadyLocked = !!existing?.betting_locked_at;

      let oddsA = existing?.odds_a ?? null;
      let oddsB = existing?.odds_b ?? null;
      let bettingLockedAt = existing?.betting_locked_at ?? null;

      if (status === "upcoming" && !alreadyLocked) {
        const ratingA = ratingById.get(teamAId) ?? 1500;
        const ratingB = ratingById.get(teamBId) ?? 1500;
        const odds = computeOdds(ratingA, ratingB);
        oddsA = odds.oddsA;
        oddsB = odds.oddsB;
      }

      if (status === "running" && !alreadyLocked) {
        bettingLockedAt = new Date().toISOString();
        if (oddsA === null || oddsB === null) {
          const ratingA = ratingById.get(teamAId) ?? 1500;
          const ratingB = ratingById.get(teamBId) ?? 1500;
          const odds = computeOdds(ratingA, ratingB);
          oddsA = odds.oddsA;
          oddsB = odds.oddsB;
        }
      }

      return {
        id: m.id,
        game_id: gameId,
        team_a_id: teamAId,
        team_b_id: teamBId,
        status,
        scheduled_at: m.scheduled_at ?? m.begin_at,
        odds_a: oddsA,
        odds_b: oddsB,
        betting_locked_at: bettingLockedAt,
        raw: m as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      };
    });

    const { error: matchesError } = await supabase.from("matches").upsert(matchRows, {
      onConflict: "id",
    });
    if (matchesError) throw new Error(`matches upsert failed: ${matchesError.message}`);
    matchesUpserted += matchRows.length;
  }

  return NextResponse.json({ teamsUpserted, matchesUpserted, skipped });
}
