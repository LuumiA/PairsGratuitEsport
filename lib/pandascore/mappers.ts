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
