import { Swords } from "lucide-react";
import { getUpcomingAndLiveMatches } from "@/lib/data/matches";
import { GAMES } from "@/lib/data/games";
import { MatchesBrowser } from "@/components/features/matches/matches-browser";

export const metadata = { title: "Matchs" };
export const revalidate = 60;

export default async function MatchesPage() {
  const matches = await getUpcomingAndLiveMatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Swords className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Matchs à venir</h1>
      </div>

      <MatchesBrowser matches={matches} games={GAMES} />
    </div>
  );
}
