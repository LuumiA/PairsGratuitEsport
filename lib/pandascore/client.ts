import "server-only";
import type { PandaScoreMatch } from "@/lib/pandascore/types";

const BASE_URL = "https://api.pandascore.co";

export type VideogameSlug = "valorant" | "csgo" | "lol";

async function pandaScoreFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(BASE_URL + path);
  url.searchParams.set("per_page", "50");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.PANDASCORE_API_KEY}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PandaScore ${path} failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export function getUpcomingMatches(slug: VideogameSlug) {
  return pandaScoreFetch<PandaScoreMatch[]>(`/${slug}/matches/upcoming`);
}

export function getRunningMatches(slug: VideogameSlug) {
  return pandaScoreFetch<PandaScoreMatch[]>(`/${slug}/matches/running`);
}

export function getRecentPastMatches(slug: VideogameSlug) {
  return pandaScoreFetch<PandaScoreMatch[]>(`/${slug}/matches/past`, { sort: "-modified_at" });
}
